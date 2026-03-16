"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from "./page.module.css";
import { ref, set, onValue, get } from "firebase/database";
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
  Grid,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import StartFirebase from "@/utlis/configFirebase";
import { Check, Close, Delete, Edit } from "@mui/icons-material";
import Image from "next/image";
import IMG_1 from "../assets/demo1.jpg";
import IMG_2 from "../assets/gambar2.jpeg";

const db = StartFirebase();

export default function NewsForm() {
  const [listImages, _] = useState([
    { src: IMG_1, name: "demo1" },
    { src: IMG_2, name: "gambar2" },
  ]);
  const [listNews, setListNews] = useState([]);
  const [type, setType] = useState("add");
  const [active, setActive] = useState(null);
  const [idContent, setIdContent] = useState(null);
  const [showImg, setShowImg] = useState(false);
  const [formData, setFormData] = useState({
    writer: "",
    editor: "",
    title: "",
    content: "",
    date: null,
    image: "",
  });

  useEffect(() => {
    const dbRef = ref(db);
    onValue(dbRef, (snapshot) => {
      const dataFromFirebase = snapshot.val();
      if (dataFromFirebase && dataFromFirebase.data) {
        setListNews(Object.values(dataFromFirebase?.data));
        setActive(dataFromFirebase.isActive);
      } else {
        setActive(null);
        setListNews([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? newDate.format("DD-MM-YYYY HH:mm") : null;
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }));
  };

  const handleSubmit = (e) => {
    if (type === "edit") {
      set(ref(db, `data/${Number(idContent) - 1}`), {
        ...formData,
        id: idContent,
      });
    } else {
      e.preventDefault();
      set(ref(db, `data/${listNews.length}`), {
        ...formData,
        id: `${listNews.length + 1}`,
      });
    }
    setFormData({
        writer: "",
        editor: "",
        title: "",
        content: "",
        date: "",
        image: "",
      });
  };

  const handleChooseImg = (img) => () => {
    setFormData((prevData) => ({
      ...prevData,
      image: img.name,
    }));
    setShowImg(false);
  };

  const handleSwitchContent = (index) => () => {
    set(ref(db, "isActive"), index);
  };

  const handleEdit = (id) => async () => {
    setType("edit");
    setIdContent(id);
    try {
      const snapshot = await get(ref(db, `data/${Number(id) - 1}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFormData({
          writer: data.writer || "",
          editor: data.editor || "",
          title: data.title || "",
          content: data.content || "",
          date: data.date || null,
          image: data.image || "",
        });
      } else {
        console.log("Data tidak ditemukan");
      }
    } catch (error) {
      console.error("Gagal mengambil data dari Firebase:", error);
    }
  };

  return (
    <main className={styles.main}>
      <Modal
        open={showImg}
        onClose={() => setShowImg(false)}
        aria-labelledby="image-upload-modal-title"
        aria-describedby="image-upload-modal-description"
      >
        <Card className={styles.wrappCardListImg}>
          {listImages.map((img, index) => {
            return (
              <Card
                onClick={handleChooseImg(img)}
                key={index}
                sx={{
                  padding: "10px 10px 7px",
                  width: "fit-content",
                  boxShadow: 8,
                }}
              >
                <Image src={img.src} alt="" width={315} height={200} />
              </Card>
            );
          })}
        </Card>
      </Modal>
      <Paper elevation={3} sx={{ p: 4, width: "100%", height: "fit-content" }}>
        <Typography variant="h4" gutterBottom align="center">
          Formulir Pembuatan Berita 📰
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Penulis"
              name="writer"
              value={formData.writer}
              onChange={handleChange}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Editor"
              name="editor"
              value={formData.editor}
              onChange={handleChange}
              size="small"
              required
            />
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Tanggal Publikasi *"
              value={
                formData.date ? dayjs(formData.date, "DD-MM-YYYY HH:mm") : null
              }
              onChange={handleDateChange}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          <TextField
            label="Judul Berita"
            name="title"
            value={formData.title}
            onChange={handleChange}
            size="small"
            required
          />

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
              <Typography
                variant="body2"
                sx={{
                  marginTop: "10px",
                  display: "inline",
                  border: "1px solid grey",
                  padding: "5px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                }}
              >
                {formData.image}
                <Close
                  fontSize="small"
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                  onClick={() =>
                    setFormData((prevData) => ({
                      ...prevData,
                      image: "",
                    }))
                  }
                />
              </Typography>
            )}
          </Box>

          <TextField
            label="Isi Berita"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={8}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={
              !formData.writer ||
              !formData.editor ||
              !formData.title ||
              !formData.content ||
              !formData.date ||
              !formData.image
            }
          >
            Publikasikan Berita
          </Button>
        </Box>
      </Paper>
      <div className={styles.wrappListNews}>
        {listNews.length > 0 &&
          listNews.map((news, index) => {
            return (
              <div
                key={index}
                style={{ position: "relative" }}
                onClick={handleSwitchContent(index)}
              >
                {active === index && (
                  <div
                    style={{
                      backgroundColor: "#FFF",
                      padding: "2px",
                      width: "fit-content",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      top: "-5px",
                      left: "-10px",
                      zIndex: 1,
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Check color="success" />
                  </div>
                )}
                <Card
                  className={
                    active === index ? styles.activeCard : styles.wrappCard
                  }
                >
                  <Grid container spacing={2}>
                    <Grid item size={2}>
                      <div>Penulis</div>
                      <div>Editor</div>
                      <div>Tanggal</div>
                      <div>Judul</div>
                    </Grid>
                    <Grid item size={1}>
                      <div>:</div>
                      <div>:</div>
                      <div>:</div>
                      <div>:</div>
                    </Grid>
                    <Grid item size={7}>
                      <div className={styles.valueList}>{news.writer}</div>
                      <div className={styles.valueList}>{news.editor}</div>
                      <div className={styles.valueList}>{news.date}</div>
                      <div className={styles.valueList}>{news.title}</div>
                    </Grid>
                    <Grid item size={2}>
                      <IconButton onClick={handleEdit(news.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              </div>
            );
          })}
      </div>
    </main>
  );
}
