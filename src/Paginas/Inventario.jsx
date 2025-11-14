import { useEffect, useState } from "react";

export function Inventario() {
  const [figurinhas, setFigurinhas] = useState([]);

  useEffect(() => {
    const armazenado = JSON.parse(localStorage.getItem("inventario")) || [];
    setFigurinhas(armazenado);
  }, []);

  const limparInventario = () => {
    if (!window.confirm("Deseja realmente limpar o inventário?")) return;
    localStorage.removeItem("inventario");
    setFigurinhas([]);
  };

  return (
    <main className="inventario">
      <h2>Inventário</h2>
      <button 
        className="limpar-inventario" 
        onClick={limparInventario}
        aria-disabled={figurinhas.length === 0}
      >
        Limpar Inventário
      </button>

      {figurinhas.length === 0 ? (
        <p className="vazio">Nenhuma figurinha coletada ainda!</p>
      ) : (
        <section className="grid" aria-label="Lista de figurinhas coletadas">
          {figurinhas.map((f) => (
            <article 
              key={f.id} 
              className="figurinha" 
              aria-labelledby={`figurinha-${f.id}`}
            >
              <figure>
                <img src={f.imagem} alt={f.nome} />
                <figcaption id={`figurinha-${f.id}`}></figcaption>
              </figure>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}