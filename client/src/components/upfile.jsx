import React, { useState } from 'react';
import axios from "axios"

const FileUpload = () => {
    const [status, setStatus] = useState(null);
    const [files, setFiles] = useState(null);
    const [progress, setProgress] = useState({ started: false, pc: 0 });
    const upload = () => {

        if (!files) {
            console.log("No file selected");
            setStatus("No file selected")
            return;
        }

        const formData = new FormData();
        // for (let i = 0; i < files.length; i++) {
        //     formData.append(`file${i + 1}`, files[i]);
        // }

        // setStatus("Uploading...");

        // setProgress(prevState => {
        //     return { ...prevState, started: true }
        // })
        // axios.post('https://localhost:4000/upload', formData, {
        //     onDownloadProgress: (progressEvent) => {
        //         setProgress(prevState => {
        //             return { ...prevState, pc: progressEvent.progress * 100 }
        //         })
        //     },
        //     headers: {
        //         "Custom-Header": "value",
        //     }
        // })
        //     .then(res => {
        //         console.log(res.data);
        //         setStatus("upload successful");
        //     })
        //     .catch(err => {
        //         setStatus("Upload failed");
        //     })

        formData.append('file', files)
        axios.post('https://localhost:4000/upload', formData)
            .then(res => {
                setStatus("Upload successful")
             })
            
            .catch(er =>{
                console.log(er);
                setStatus("Upload failed");
            } )
    }

    return (
        <div className='container-upload'>
            <h3>File Upload:</h3>
            {/* <input type="file" onChange={(e) => { setFiles(e.target.files) }} multiple />
            <br />
            <button type="button" onClick={upload}>Upload</button>
            <br />
            {progress.started && <progress max="100" value={progress.pc}></progress>}<br></br> */}

            <input type="file" onChange={(e) => setFiles(e.target.files[0])} />
            <br/>
            <button type="button" onClick={upload}>Upload</button>
            <br/>
            {status && <span>{status}</span>}
        </div>
    );
};

export default FileUpload;
