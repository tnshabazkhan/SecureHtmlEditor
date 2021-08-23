import React, {useState} from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.global.css';

var CryptoJS = require("crypto-js");

const Hello = () => {
  const [fileContent, setFileContent] = useState("");
  const [filePath, setFilePath] = useState("");

  const fileChange = (e, editor) =>
  {
    const data = editor.getData();
    console.log( { event, editor, data } );
    setFileContent(data);
  }

  const openFile = async () =>
  {
    console.log(window);
    const response = await window.electron.dialog.showOpenDialog({ properties: ['openFile'], filters:  [{ name: 'Html File', extensions: ['html'] }] });
    if(!response.canceled && response.filePaths.length === 1){
      console.log(response.filePaths);
      const filePath = response.filePaths[0];
      console.log(filePath);
      setFilePath(filePath);
      try {
        const ciphertext = window.electron.fs.readFileSync(filePath, 'utf8');

        if(!ciphertext.includes("<html>")){
          let bytes = CryptoJS.AES.decrypt(ciphertext, 'my-secret-key@123');
          let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          console.log("file is encrypted"); 
          setFileContent(decryptedData); 
        } else {
          setFileContent(ciphertext); 
        }         
      } catch (err) {
        console.error(err)
      }
    }
    else{
      console.log("canceled");
    }

    //setFileContent(data);
  }

  const saveFile = () =>
  {
    try {
      let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(fileContent), 'my-secret-key@123').toString();
      
      window.electron.fs.writeFileSync(filePath, ciphertext);
      //file written successfully
    } catch (err) {
      console.error(err)
    }
  }

  const saveFileAs = async () =>
  {
    const response = await window.electron.dialog.showSaveDialog({ filters:  [{ name: 'Html File', extensions: ['html'] }] });
    console.log(response);
    if(!response.canceled && response.filePath.length > 0){
      try {
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(fileContent), 'my-secret-key@123').toString();
      
        window.electron.fs.writeFileSync(response.filePath, ciphertext);

        setFilePath(response.filePath);
      } catch (err) {
        console.error(err)
      }
    }
    else{
      console.log("canceled");
    }
  }

  const closeFile = () => {
    setFilePath("");
    setFileContent("");
  }

  return (
    <div>
      <div className="buttonContainer">
        <button onClick={openFile}>
          Open File
        </button>
        <button onClick={saveFile} disabled={filePath.length === 0}>
          Save File
        </button>
        <button onClick={saveFileAs}>
          Save As
        </button>
        <button onClick={closeFile}>
          Close File
        </button>
      </div>
      <CKEditor
                    editor={ ClassicEditor }
                    data={fileContent}
                    onReady={ editor => {
                        // You can store the "editor" and use when it is needed.
                        console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={fileChange}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
