export function MissaoCard({ missao, onIniciarMissao, concluida }) {

  //se a prop concluida não foi passada, checa no localStorage
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const concluidaLocal = inventario.some((f) => f.id === missao.id);

  //Valor final da flag concluída (propriedade para a prop)
  const isConcluida = concluida !== undefined ? concluida : concluidaLocal;

  return (
    <article 
      className='missao-card' 
      tabIndex="0"
      aria-labelledby={`missao-title-${missao.id}`}
    >
      <h3 id={`missao-title-${missao.id}`}>{missao.titulo}</h3>
      <p>{missao.missao}</p>
      <button 
        className="button_missao" 
        onClick={() => onIniciarMissao(missao)}  
        disabled={isConcluida}
        aria-disabled={isConcluida}
      >
        {isConcluida ? "Missão concluída" : "Iniciar Missão"}
      </button>
    </article>
  )
}