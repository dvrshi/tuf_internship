'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OutputWindow from '@/components/OutputWindow';

function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outputDetails, setOutputDetails] = useState(Array(data.length).fill(null));
  const [processing, setProcessing] = useState(false);

  const handleCompileClick = async (index) => {
    console.log('Clicked on button with index:', index);
    
    const snippet = data[index];

    try {
      setProcessing(true);
      const formData = {
        language_id: snippet.langid,
        source_code: btoa(snippet.source_code),
        stdin: btoa(snippet.stdin),
      };

      const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'true', fields: '*' },
        headers: {
          'content-type': 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': `${process.env.NEXT_PUBLIC_CODE_JUDGE_API_KEY}`,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        data: formData,
      };

      const response = await axios.request(options);
      const token = response.data.token;
      checkStatus(token, index);
    } catch (error) {
      console.error('Error compiling code:', error);
      setProcessing(false);
    }
  };

  const checkStatus = async (token, index) => {
    const options = {
      method: 'GET',
      url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      params: { base64_encoded: 'true', fields: '*' },
      headers: {
        'X-RapidAPI-Key': `${process.env.NEXT_PUBLIC_CODE_JUDGE_API_KEY}`,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    };

    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token, index);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        const newOutputDetails = [...outputDetails];
        newOutputDetails[index] = response.data;
        setOutputDetails(newOutputDetails);
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setProcessing(false);
    }
  };

  const fetchData = () => {
    setLoading(true);
    fetch('https://backend-tuf-5227edb06eb4.herokuapp.com/api/getdata')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setOutputDetails(Array(data.length).fill(null)); // Initialize outputDetails array with null values
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='items-center flex flex-col gap-4 mt-4'>
      <button onClick={handleRefresh} className='bg-sky-600 p-2 rounded-lg text-white'>Refresh</button>
      <table className="table-auto w-4/5 mx-auto text-white text-center">
        <thead>
          <tr>
            <th>Username</th>
            <th>Code Language</th>
            <th>Standard Input</th>
            <th>Source Code</th>
            <th>Submission Timestamp</th>
            <th>Compile?</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {data.map((snippet, index) => (
            <tr key={index} className='h-auto'>
              <td>{snippet.username}</td>
              <td>{snippet.code_language}</td>
              <td>{snippet.stdin}</td>
              <td>{snippet.source_code.length > 100 ? snippet.source_code.substring(0, 100) : snippet.source_code}</td>
              <td>{snippet.submission_timestamp}</td>
              <td>
                <button disabled={processing} onClick={() => handleCompileClick(index)}>Compile</button>
              </td>
              <td>
                <OutputWindow outputDetails={outputDetails[index]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Page;
