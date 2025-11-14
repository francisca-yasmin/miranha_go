import { useState, useEffect, useRef } from "react";

import sucesso from "../assets/miranha_go/wiinnnn.png";
import erro from "../assets/miranha_go/erroooou.png";

export function MissaoModal({ missao, onClose, onConcluir }) {
  const [resposta, setResposta] = useState("");
  const [resultado, setResultado] = useState(null);
  const [status, setStatus] = useState(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  // Foco inicial no input ao abrir modal
  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const verificarResposta = () => {
    if (!resposta.trim()) {
      alert("Por favor, digite uma resposta antes de enviar!");
      return;
    }

    if (resposta.trim().toLowerCase() === missao.respostaCorreta.trim().toLowerCase()) {
      setResultado("Resposta correta! Parabéns!");
      setStatus("sucesso");

      // Concluir missão após 1s
      setTimeout(() => {
        onConcluir(missao.id);
      }, 1000);
    } else {
      setResultado("Resposta incorreta. Tente novamente!");
      setStatus("erro");
    }
  };

  return (
    <dialog
      open
      className="modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-missao"
      aria-describedby="descricao-missao"
    >
      <h2 className="titulo" id="titulo-missao">
        {missao.titulo}
      </h2>
      <p id="descricao-missao">{missao.descricao}</p>

      <label htmlFor="resposta" className="sr-only">
        Digite sua resposta
      </label>
      <input
        className="caixaTexto"
        id="resposta"
        type="text"
        placeholder="Digite sua resposta..."
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
        required
        ref={inputRef}
      />

      <div className="modal-botoes">
        <button onClick={verificarResposta} aria-label="Enviar resposta">
          Enviar
        </button>
        <button onClick={onClose} aria-label="Fechar modal">
          Fechar
        </button>
      </div>

      {resultado && (
        <div
          className="resultado"
          role="status"
          aria-live="polite"
        >
          <p>{resultado}</p>
          {status === "sucesso" && (
            <img
              src={sucesso}
              alt="Missão concluída com sucesso"
              width="100"
            />
          )}
          {status === "erro" && (
            <img
              src={erro}
              alt="Erro na resposta da missão"
              width="100"
            />
          )}
        </div>
      )}
    </dialog>
  );
}
