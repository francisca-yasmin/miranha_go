import { useState } from "react";
import { missoes } from "../Dados/dadosMissao";
import { MissaoCard } from "../Componentes/MissaoCard";
import { MissaoModal } from "../Componentes/MissaoModal";

export function Missao() {
  const [missaoSelecionada, setMissaoSelecionada] = useState(null);
  const [refresh, setRefresh] = useState(0);

const concluirMissao = (id, imagemEscolhida) => {
  // Lê o inventário existente
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  // Encontra os dados da missão
  const m = missoes.find((ms) => ms.id === id);

  const listaFigurinhas = [
    "/src/assets/miranha_go/erroooou.png",
    "/src/assets/miranha_go/wiinnnn.png",
    "/src/assets/miranha_go/heart.png"
  ];

  // --- NOVO: sorteia quantas figurinhas a missão vai dar (1 a 3) ---
  const quantidade = Math.floor(Math.random() * 2) + 1;

  for (let i = 0; i < quantidade; i++) {
    // --- NOVO: sorteia uma figurinha da lista ---
    const imagemSorteada =
      imagemEscolhida ||
      listaFigurinhas[Math.floor(Math.random() * listaFigurinhas.length)];

    // Cria o objeto figurinha
    const figurinha = {
      id: `${m.id}-${i}`, // ID único mesmo repetindo missão
      nome: m.titulo || `Figurinha ${m.id}`,
      imagem: imagemSorteada,
    };

    // Evita duplicar a mesma imagem
    if (!inventario.some((f) => f.imagem === imagemSorteada)) {
      inventario.push(figurinha);
    }
  }

  // Salva tudo
  localStorage.setItem("inventario", JSON.stringify(inventario));

  // Fecha o modal e atualiza
  setMissaoSelecionada(null);
  setRefresh((r) => r + 1);
};

  return (
    <section className="conteiner" aria-labelledby="titulo-missoes">
      <h2 id="titulo-missoes">Missões</h2>

      <section
        className="missoes-grid"
        aria-label="Lista de missões disponíveis"
      >
        {missoes.map((m) => (
          <MissaoCard
            key={`${m.id}-${refresh}`}
            missao={m}
            onIniciarMissao={setMissaoSelecionada}
          />
        ))}
      </section>

      {missaoSelecionada && (
        <MissaoModal
          missao={missaoSelecionada}
          onClose={() => setMissaoSelecionada(null)}
          onConcluir={concluirMissao}
        />
      )}
    </section>
  );
}