import { useState } from "react";
import { Camera } from "../Componentes/Camera";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import toast, { Toaster } from "react-hot-toast";

export function Galeria() {
  const [fotos, setFotos] = useState([]);

  const adicionarFoto = (novaFoto) => {
    setFotos((prevFotos) => {
      const atualizadas = [...prevFotos, novaFoto];

      if (atualizadas.length % 3 === 0) {
        toast.success(`Você já tirou ${atualizadas.length} fotos!`);
      }

      return atualizadas;
    });
  };

  return (
    <main className="container">
      <Toaster position="top-right" reverseOrder={false} />

      <Camera onFotoTirada={adicionarFoto} />

      <h2>Galeria de Fotos</h2>

      {fotos.length === 0 ? (
        <p className="mensagem-vazia">Nenhuma foto ainda! Tire uma com a câmera.</p>
      ) : (
        <ImageList
        sx={{
            width: "100%",
            maxWidth: 900,
            margin: "20px auto",
            height: "auto",
        }}
        cols={4}
        rowHeight={164}
        >
        {fotos.map((foto, index) => (
            
            <ImageListItem key={index}>
            <img
                src={foto}
                alt={`Foto ${index + 1}`}
                loading="lazy"
                style={{ borderRadius: "8px", objectFit: "cover" }}
            />
            </ImageListItem>
        ))}
        </ImageList>
      )}
    </main>
  );
}