'use client'
import React from 'react'
import axios from "axios";
import Link from 'next/link';
import { languageOptions } from '@/app/constants/Languages';
import { useState, useEffect } from "react";
import CodeEditorWindow from './CodeEditorWindow';
import OutputWindow from './OutputWindow';
function inputDiv() {
  const javascriptDefault = `// some comment`;
  const [code, setCode] = useState(javascriptDefault);
  const [language, setLanguage] = useState(languageOptions[0].name);
  const [langid, setLangID] = useState(languageOptions[0].id);
  const [email, setEmail] = useState('');
  const [stdin, setStdin] = useState('');
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleStdinChange = (event) => {
    setStdin(event.target.value);
  };
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    // console.log(selectedValue);
    const selectedLanguage = (languageOptions.find(option => option.name === selectedValue)).name;
    const selectedLangID = (languageOptions.find(option => option.name === selectedValue)).id;
    // console.log(selectedLanguage, selectedLangID);
    setLangID(selectedLangID);
    setLanguage(selectedLanguage);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log('Email:', email);
    // console.log('Language:', language);
    // console.log('LangID:', langid);
    // console.log('STDIn:', stdin);
    // console.log('Code:', code);
    if(!email)
      {
        console.log("Email is required");
        setEmail('Email is required');
        return;
      }
    axios.post("https://backend-tuf-5227edb06eb4.herokuapp.com/api/senddata", {
      username: email,
      code_language: language,
      stdin: stdin,
      source_code: code,
      language_id: langid
    }, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    })
      .then(response => {
        console.log(response.data); // Handle response data from server
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
  };


  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: langid,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(stdin),
    };
    // console.log("formData", formData);
    // console.log(process.env. NEXT_PUBLIC_CODE_JUDGE_API_KEY)
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        'X-RapidAPI-Key': `${process.env.NEXT_PUBLIC_CODE_JUDGE_API_KEY}`,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions" + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        'X-RapidAPI-Key': `${process.env.NEXT_PUBLIC_CODE_JUDGE_API_KEY}`,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        // showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      // showErrorToast();
    }
  };

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  return (
    <div className='flex gap-4 mx-4'>
      <div className='w-full flex flex-col gap-2 text-white'>

        <CodeEditorWindow
          code={code}
          onChange={onChange}
          language={language?.value}
          theme={"dracula"}
        />
        <text>Output</text>
        <div className='bg-neutral-600 h-48 py-2 px-4'>
        <OutputWindow outputDetails={outputDetails}/>
        </div>
      </div>
      <div className='flex flex-col gap-4 mt-20'>

        <select onChange={handleSelectChange} value={language ? language.name : ''} className='text-white py-2 bg-neutral-700 rounded-md border-2'>
          <option value="">Select a language</option>
          {languageOptions.map(option => (
            <option key={option.id} value={option.name}>{option.name}</option>
          ))}
        </select>

        <form onSubmit={handleSubmit} className=' flex flex-col gap-4'>
          <input
            type="text"
            placeholder="Enter email"
            className="w-4/5 h-10 text-white bg-neutral-700 rounded-md border-2 p-2"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />


          <textarea
            placeholder="STDIn"
            className="w-4/5 h-48 text-white bg-neutral-700 rounded-md border-2 p-2"
            value={stdin}
            onChange={handleStdinChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
              }
            }}
          />
          <div>
            <button type="submit" className='text-white py-1 rounded-sm border-2 bg-neutral-500 w-20 mr-2'>Submit</button>
            <button onClick={handleCompile} disabled={processing} className='text-white py-1 rounded-sm ml-2 border-2 bg-neutral-500 w-20'>
              Compile</button>
          </div>
        </form>
        <Link href="/dashboard">Dashboard</Link>
        

      </div>
    </div>
  )
}

export default inputDiv