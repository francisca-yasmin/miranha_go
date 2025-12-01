import missao from '../assets/missao.png';
import mapa from '../assets/mapa.png';
import bau from '../assets/bau.png';
import camera from '../assets/camera.png';
import { Link } from 'react-router-dom';

export function Menu() {
  return (
    <nav
      className="menu"
      role="navigation"
      aria-label="Menu principal do jogo DS GO"
    >
      <ul className="menu-list">
        <li>
          <Link
            to="missao"
            aria-label="Ir para a página de Missões"
            className="menu-item"
          >
            <figure>
              <img
                src={missao}
                alt="Ícone de missões"
                role="img"
                aria-hidden="true"
              />
              <figcaption>Missões</figcaption>
            </figure>
          </Link>
        </li>

        <li>
          <Link
            to="inventario"
            aria-label="Ir para o inventário de figurinhas"
            className="menu-item"
          >
            <figure>
              <img
                src={bau}
                alt="Ícone de inventário"
                role="img"
                aria-hidden="true"
              />
              <figcaption>Inventário</figcaption>
            </figure>
          </Link>
        </li>

        <li>
          <Link
            to="mapa"
            aria-label="Abrir mapa de geolocalização"
            className="menu-item"
          >
            <figure>
              <img
                src={mapa}
                alt="Ícone de mapa"
                role="img"
                aria-hidden="true"
              />
              <figcaption>GeoLocalização</figcaption>
            </figure>
          </Link>
        </li>

        <li>
          <Link
            to="camera"
            aria-label="Abrir câmera"
            className="menu-item"
          >
            <figure>
              <img
                src={camera}
                alt="Ícone de câmera"
                role="img"
                aria-hidden="true"
              />
              <figcaption>Câmera</figcaption>
            </figure>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
