import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useMutation, gql } from '@apollo/client';

const GET_PRESIGNED_URL = gql`
  mutation GetPresignedUrl($fileName: String!, $fileType: String!) {
    getPresignedUrl(fileName: $fileName, fileType: $fileType)
  }
`;

export default function ImageUpload({ onUpload, accept = "image/*" }) {
  const [getPresignedUrl] = useMutation(GET_PRESIGNED_URL);

  const onDrop = useCallback(async (acceptedFiles) => {


    if (!acceptedFiles.length) return;

    for (const file of acceptedFiles) {
      try {
        const res = await getPresignedUrl({
          variables: {
            fileName: file.name,
            fileType: file.type,
          },
        });
    
        const presignedUrl = res.data.getPresignedUrl;
    
        await axios.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
        });
    
        const s3Url = presignedUrl.split('?')[0];
        onUpload(s3Url); // <-- Will be called once for each file
      } catch (error) {
        alert(`Upload failed for ${file.name}: ` + (error?.message || 'Unknown error'));
      }
    }

  }, [onUpload, getPresignedUrl]);

  // Pass `accept` prop to dropzone for image or video support
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

  return (
    <div {...getRootProps()} style={{ border: "2px dashed #888", padding: 20, textAlign: "center", cursor: "pointer" }}>
      <input {...getInputProps()} />
      {isDragActive
        ? `Drop the file here ...`
        : `Drag & drop file here, or click to select`}
    </div>
  );
}
