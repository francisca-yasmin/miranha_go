import { useRef, useState, useEffect } from "react";

export function Camera({ onFotoTirada }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [foto, setFoto] = useState(null);

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
    }
  };

  useEffect(() => {
    iniciarCamera();
  }, []);

  const tirarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imagem = canvas.toDataURL("image/png");
    setFoto(imagem);
    onFotoTirada(imagem);
  };

  const reiniciar = () => {
    setFoto(null);
    iniciarCamera();
  };

  return (
    <section className="camera-box">
      <h2>Captura de Imagem</h2>

      <div className="preview">
        {!foto ? (
          <video ref={videoRef} autoPlay playsInline />
        ) : (
          <img src={foto} alt="foto capturada" />
        )}
      </div>

      <div className="botoes">
        {!foto ? (
          <button onClick={tirarFoto}>Tirar Foto</button>
        ) : (
          <button onClick={reiniciar}>Nova Foto</button>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </section>
  );
}