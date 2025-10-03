"use client";

// import Image from "next/image";
// import styles from "./page.module.css";
// import { TextField } from "@mui/material";
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from 'dayjs';

// export default function Home() {
//   return (
//     <main className={styles.main}>
//       <div>
//         <TextField size="small" label="Writer" />
//         <TextField size="small" label="Editor" />
//         <TextField size="small" label="Title" />
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DatePicker
//             label="Pilih Tanggal"
//           />
//         </LocalizationProvider>
//       </div>
//     </main>
//   );
// }


// components/NewsForm.js

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import styles from "./page.module.css";
import { ref, set, onValue, get } from 'firebase/database';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  IconButton,
  Modal,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import StartFirebase from '@/utlis/configFirebase';
import { Close, Delete, Edit } from '@mui/icons-material';
import Image from 'next/image';
import IMG_1 from '../assets/demo1.jpg';

const db = StartFirebase();

export default function NewsForm() {
  const [listImages, _] = useState([{ src: IMG_1, name: 'demo1' }]);
  const [listNews, setListNews] = useState([]);
  const [type, setType] = useState('add');
  const [showImg, setShowImg] = useState(false);
  const [formData, setFormData] = useState({
    writer: '',
    editor: '',
    title: '',
    content: '',
    date: null,
    image: '',
  });

  useEffect(() => {
    const dbRef = ref(db);
    onValue(dbRef, (snapshot) => {
      const dataFromFirebase = snapshot.val();
      if (dataFromFirebase && dataFromFirebase.data) {
        setListNews(Object.values(dataFromFirebase?.data));
      } else {
        setListNews([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? newDate.format('DD-MM-YYYY HH:mm') : null;
    setFormData(prevData => ({
      ...prevData,
      date: formattedDate
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    set(ref(db, `data/${listNews.length}` ), {
      ...formData,
      id: `${listNews.length + 1}`
    });
    setFormData({
      writer: '',
      editor: '',
      title: '',
      content: '',
      date: '',
      image: '',
    });
  };

  const handleChooseImg = (img) => () => {
    setFormData(prevData => ({
      ...prevData,
      image: img.name
    }));
    setShowImg(false);
  }

  return (
    <main className={styles.main}>
      <Modal
        open={showImg}
        onClose={() => setShowImg(false)}
        aria-labelledby="image-upload-modal-title"
        aria-describedby="image-upload-modal-description"
      >
        <Card sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          p: 4,
        }}>
          {listImages.map((img, index) => {
            return (
              <Card
                onClick={handleChooseImg(img)}
                key={index}
                sx={{ padding: '10px 10px 7px', width: 'fit-content', boxShadow: 8 }}
              >
                <Image src={img.src} alt='' width={315} height={200} />
              </Card>
            );
          })}
        </Card>
      </Modal>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Formulir Pembuatan Berita 📰
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {/* Input: Writer & Editor (menggunakan Stack untuk layout horizontal) */}
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Penulis (Writer)"
              name="writer"
              value={formData.writer}
              onChange={handleChange}
              size='small'
              required
            />
            <TextField
              fullWidth
              label="Editor"
              name="editor"
              value={formData.editor}
              onChange={handleChange}
              size='small'
              required
            />
          </Stack>

          {/* Input: Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Tanggal Publikasi"
              value={formData.date ? dayjs(formData.date, 'DD-MM-YYYY HH:mm') : null}
              onChange={handleDateChange}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          {/* Input: Title */}
          <TextField
            label="Judul Berita (Title)"
            name="title"
            value={formData.title}
            onChange={handleChange}
            size='small'
            required
          />

          {/* Input: File Upload */}
          <Box>
            <Button
              fullWidth
              variant={formData.image ? "contained" : "outlined"}
              component="label"
              size="small"
              disabled={formData.image}
              onClick={() => setShowImg(true)}
            >
              Pilih Gambar
            </Button>
            {formData.image && (
              <Typography variant="body2"
                sx={{
                  marginTop: '10px',
                  display: 'inline',
                  border: '1px solid grey',
                  padding: '5px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 'fit-content'
                }}
              >
                {formData.image}
                <Close
                  fontSize='small'
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                  onClick={() => setFormData(prevData => ({
                    ...prevData,
                    image: ''
                  }))}
                />
              </Typography>
            )}
          </Box>

          {/* Input: Content */}
          <TextField
            label="Isi Berita (Content)"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={10}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={!formData.writer || !formData.editor || !formData.title || !formData.content || !formData.date || !formData.image}
          >
            Publikasikan Berita
          </Button>
        </Box>
      </Paper>
      <div className={styles.wrappListNews}>
        {listNews.length > 0 &&
          listNews.map((news, index) => {
            return (
              <Card key={index} className={styles.wrappCard}>
                <div style={{ display: 'flex' }}>
                  <div style={{ marginRight: '20px' }}>
                    <div>Penulis : <span className={styles.valueList}>{news.writer}</span></div>
                    <div>Editor : <span className={styles.valueList}>{news.editor}</span></div>
                  </div>
                  <div>
                    <div>Tanggal : <span className={styles.valueList}>{news.date}</span></div>
                    <div>Judul : <span className={styles.valueList}>{news.title}</span></div>
                  </div>
                </div>
                <div>
                  <IconButton><Edit /></IconButton>
                  <IconButton><Delete /></IconButton>
                </div>
              </Card>
            )
          })}
      </div>
    </main>
  );
}