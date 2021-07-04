import React, { useRef, useState, useEffect } from "react";
import "./ImageUpload.css";
import Button from "./Button";

const ImageUpload = (props) => {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState();
  const [isValid, setIsValid] = useState(false);
  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewURL(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (e) => {
    console.log(e.target.value);
    console.log(`picked an image!`);
    let pickedFile;
    let fileIsValid = isValid;
    if (e.target.files && e.target.files.length === 1) {
      pickedFile = e.target.files[0];
      setFile(pickedFile);
      console.log(`set file to ${pickedFile}`);
      setIsValid(true);
      fileIsValid = true;
      //nice work around since the useState hook is async and you cannot await it
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
    console.log(`here's props id ${props.id}`);
  };
  const imageHandler = () => {
    filePickerRef.current.click();
  };
  return (
    <div className="form-control">
      <input
        style={{ display: "none" }}
        ref={filePickerRef}
        id={props.id}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewURL && <img src={previewURL} alt="image preview" />}
          {!previewURL && <p>Please choose an imagine!</p>}
        </div>
        <Button type="button" onClick={imageHandler}>
          Pick an image!
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
