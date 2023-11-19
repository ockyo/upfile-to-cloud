
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/upfile.css'

const FileUpload = () => {
    const [status, setStatus] = useState(null);
    const [files, setFiles] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [progress, setProgress] = useState({ started: false, pc: 0 });

    useEffect(() => {
        // Fetch the list of files from the server when the component mounts
        const fetchFileList = async () => {
            try {
                const response = await axios.get('https://localhost:4000/files');
                setFileList(response.data);
            } catch (error) {
                console.error('Error fetching file list:', error.message);
            }
        };

        fetchFileList();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    const handleFileChange = (e) => {
        setFiles(e.target.files[0]);
    };

    const upload = () => {
        if (!files) {
            console.log('No file selected');
            setStatus('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', files);

        axios
            .post('https://localhost:4000/upload', formData, {
                onDownloadProgress: (progressEvent) => {
                    setProgress((prevState) => ({
                        ...prevState,
                        started: true,
                        pc: (progressEvent.loaded / progressEvent.total) * 100,
                    }));
                },
                headers: {
                    'Custom-Header': 'value',
                },
            })
            .then((res) => {
                setStatus('Upload successful');
            })
            .catch((err) => {
                console.log(err);
                setStatus('Upload failed');
            });
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(`https://localhost:4000/download/${selectedFile}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', selectedFile);
            document.body.appendChild(link);
            link.click();
            setStatus('Download successful');
        } catch (error) {
            console.error('Error downloading file:', error.message);
            setStatus('Download failed');
        }
    };

    return (
        <div className="container-upload">
            <h3>File Upload:</h3>
            <input type="file" onChange={handleFileChange} />
            <br />
            <button type="button" onClick={upload}>
                Upload
            </button>
            <br />
        <h3>File Download:</h3>
            <label htmlFor="fileSelect">Select File for Download:</label>
            <select id="fileSelect" onChange={(e) => setSelectedFile(e.target.value)} value={selectedFile}>
                <option value="">Select a file</option>
                {fileList.map((file) => (
                    <option key={file} value={file}>
                        {file}
                    </option>
                ))}
            </select>
            <button onClick={handleDownload} disabled={!selectedFile}>
                Download
            </button>
            <br />
            {progress.started && <progress max="100" value={progress.pc}></progress>}
            <br /> {status && <span>{status}</span>}<br />
        </div>
    );
};

export default FileUpload;
