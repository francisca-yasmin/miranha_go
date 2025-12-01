import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default function Mapa({ onCoordsSelected } = {}) {
  const navigate = useNavigate();

  // referências do mapa/controls
  const mapaRef = useRef(null); // objeto L.Map
  const controleRotaRef = useRef(null);
  const containerRef = useRef(null);
  const previewUrlRef = useRef(null);

  // acessibilidade: foco
  const primeiroCampoRef = useRef(null);
  const ultimoFocoAntesRef = useRef(null);

  // estado do formulário
  const [form, setForm] = useState({
    latOrigem: "",
    lngOrigem: "",
    latDestino: "",
    lngDestino: "",
  });

  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);

  const [erros, setErros] = useState({});
  const [erroGeo, setErroGeo] = useState(null);

  // Inicializa mapa apenas uma vez
  useEffect(() => {
    if (mapaRef.current) return;

    const mapa = L.map("mapa-geolocalizacao", {
      center: [-23.55, -46.63],
      zoom: 12,
      preferCanvas: true,
    });
    mapaRef.current = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapa);

    // garantir que o mapa calcule o tamanho final
    const t1 = setTimeout(() => {
      try { mapa.invalidateSize(); } catch {}
    }, 200);
    const t2 = setTimeout(() => {
      try { mapa.invalidateSize(); } catch {}
    }, 600);

    const onResize = () => {
      try { mapa.invalidateSize(); } catch {}
    };
    window.addEventListener("resize", onResize);

    // ResizeObserver no overlay para detectar mudanças no layout (modal open/close)
    let ro = null;
    if (window.ResizeObserver && containerRef.current) {
      ro = new ResizeObserver(() => {
        try { mapa.invalidateSize(); } catch {}
      });
      ro.observe(containerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();

      // cleanup routing control
      try {
        if (controleRotaRef.current && controleRotaRef.current.remove) controleRotaRef.current.remove();
      } catch {}

      try { mapa.remove(); } catch {}
      mapaRef.current = null;

      if (previewUrlRef.current) {
        try { URL.revokeObjectURL(previewUrlRef.current); } catch {}
        previewUrlRef.current = null;
      }
    };
  }, []);

  // quando preview muda, forçar invalidate do mapa
  useEffect(() => {
    if (!mapaRef.current) return;
    const id = setTimeout(() => {
      try { mapaRef.current.invalidateSize(); } catch {}
    }, 150);
    return () => clearTimeout(id);
  }, [preview]);

  // A11Y: foco inicial, trap de foco e Esc para fechar
  useEffect(() => {
    // guarda último foco
    ultimoFocoAntesRef.current = document.activeElement;
    // foca o primeiro campo
    const f = primeiroCampoRef.current;
    if (f && typeof f.focus === "function") f.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        // mantém botão visual igual - só navegamos
        navigate("/dsgo");
      } else if (e.key === "Tab") {
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const items = Array.prototype.slice.call(focusables).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // restaura foco
      try {
        if (ultimoFocoAntesRef.current && typeof ultimoFocoAntesRef.current.focus === "function") {
          ultimoFocoAntesRef.current.focus();
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validarCampos() {
    const temp = {};
    if (!form.latOrigem) temp.latOrigem = "Informe a latitude da origem.";
    if (!form.lngOrigem) temp.lngOrigem = "Informe a longitude da origem.";
    if (!form.latDestino) temp.latDestino = "Informe a latitude do destino.";
    if (!form.lngDestino) temp.lngDestino = "Informe a longitude do destino.";
    setErros(temp);
    return Object.keys(temp).length === 0;
  }

  function gerarRota(e) {
    e?.preventDefault?.();
    if (!validarCampos()) {
      // foca no primeiro erro se houver
      const primeiroErro = containerRef.current && containerRef.current.querySelector(".aviso-erro");
      if (primeiroErro && typeof primeiroErro.focus === "function") primeiroErro.focus();
      return;
    }

    const pOrigem = L.latLng(parseFloat(form.latOrigem), parseFloat(form.lngOrigem));
    const pDestino = L.latLng(parseFloat(form.latDestino), parseFloat(form.lngDestino));

    // remove rota anterior
    if (controleRotaRef.current && controleRotaRef.current.remove) {
      try { controleRotaRef.current.remove(); } catch {}
      controleRotaRef.current = null;
    }

    try {
      controleRotaRef.current = L.Routing.control({
        waypoints: [pOrigem, pDestino],
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        lineOptions: { addWaypoints: false },
      }).addTo(mapaRef.current);

      mapaRef.current.fitBounds(L.latLngBounds([pOrigem, pDestino]), { padding: [50, 50] });

      setTimeout(() => {
        try { mapaRef.current.invalidateSize(); } catch {}
        // opcional: focar no mapa para leitores de tela
        const mapaEl = document.getElementById("mapa-geolocalizacao");
        if (mapaEl) mapaEl.focus();
      }, 150);
    } catch (err) {
      console.error("Erro ao gerar rota:", err);
      alert("Não foi possível gerar a rota. Verifique se o routing-machine está instalado.");
    }

    if (typeof onCoordsSelected === "function") {
      onCoordsSelected({ origem: pOrigem, destino: pDestino, imagem });
    }
  }

  function usarLocalizacaoOrigem() {
    if (!navigator.geolocation) {
      setErroGeo("Geolocalização não suportada.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latOrigem: pos.coords.latitude.toFixed(6),
          lngOrigem: pos.coords.longitude.toFixed(6),
        }));
        setErroGeo(null);
      },
      (err) => {
        console.error(err);
        setErroGeo("Permissão negada ou erro ao obter localização.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function usarLocalizacaoDestino() {
    if (!navigator.geolocation) {
      setErroGeo("Geolocalização não suportada.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latDestino: pos.coords.latitude.toFixed(6),
          lngDestino: pos.coords.longitude.toFixed(6),
        }));
        setErroGeo(null);
      },
      (err) => {
        console.error(err);
        setErroGeo("Permissão negada ou erro ao obter localização.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function selecionarImagem(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImagem(null);
      if (previewUrlRef.current) {
        try { URL.revokeObjectURL(previewUrlRef.current); } catch {}
        previewUrlRef.current = null;
      }
      setPreview(null);
      return;
    }
    if (previewUrlRef.current) {
      try { URL.revokeObjectURL(previewUrlRef.current); } catch {}
      previewUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImagem(file);
    setPreview(url);

    setTimeout(() => {
      try { mapaRef.current?.invalidateSize(); } catch {}
    }, 150);
  }

  function fechar() {
    navigate("/dsgo");
  }

  return (
    <section
      className="sobreposicao-geolocalizacao"
      aria-label="Gerar rota"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-geolocalizacao"
      ref={containerRef}
    >
      <div className="painel-geolocalizacao" aria-describedby="descricao-painel">
        <button
            className="botao"
            onClick={() => navigate("/winx")}
            aria-label="botão para fechar o mapa"
            title="fechar mapa"
        >
            <span aria-hidden="true">×</span>
        </button>


        <h3 id="titulo-geolocalizacao" className="titulo-painel">Gerar Rota</h3>
        <p id="descricao-painel" className="sr-only">
          Informe origem e destino. Você pode digitar lat/lng ou usar sua localização atual.
        </p>

        <form className="formulario-painel" onSubmit={gerarRota} noValidate>
          <div className="secao-painel" aria-labelledby="titulo-origem">
            <h4 id="titulo-origem">Origem</h4>

            <label htmlFor="lat-origem">Latitude</label>
            <input
              id="lat-origem"
              ref={primeiroCampoRef}
              className="entrada"
              type="number"
              step="any"
              aria-required="true"
              aria-invalid={erros.latOrigem ? "true" : "false"}
              aria-describedby={erros.latOrigem ? "erro-lat-origem" : undefined}
              value={form.latOrigem}
              onChange={(e) => setForm((p) => ({ ...p, latOrigem: e.target.value }))}
            />
            {erros.latOrigem && (
              <div id="erro-lat-origem" className="aviso-erro" role="alert" tabIndex={-1}>
                {erros.latOrigem}
              </div>
            )}

            <label htmlFor="lng-origem">Longitude</label>
            <input
              id="lng-origem"
              className="entrada"
              type="number"
              step="any"
              aria-required="true"
              aria-invalid={erros.lngOrigem ? "true" : "false"}
              aria-describedby={erros.lngOrigem ? "erro-lng-origem" : undefined}
              value={form.lngOrigem}
              onChange={(e) => setForm((p) => ({ ...p, lngOrigem: e.target.value }))}
            />
            {erros.lngOrigem && (
              <div id="erro-lng-origem" className="aviso-erro" role="alert" tabIndex={-1}>
                {erros.lngOrigem}
              </div>
            )}

            <button
              type="button"
              className="botao-acao"
              onClick={usarLocalizacaoOrigem}
              aria-label="Usar minha localização atual como origem"
            >
              Usar minha localização atual
            </button>
          </div>

          <div className="secao-painel" aria-labelledby="titulo-destino">
            <h4 id="titulo-destino">Destino</h4>

            <label htmlFor="lat-destino">Latitude</label>
            <input
              id="lat-destino"
              className="entrada"
              type="number"
              step="any"
              aria-required="true"
              aria-invalid={erros.latDestino ? "true" : "false"}
              aria-describedby={erros.latDestino ? "erro-lat-destino" : undefined}
              value={form.latDestino}
              onChange={(e) => setForm((p) => ({ ...p, latDestino: e.target.value }))}
            />
            {erros.latDestino && (
              <div id="erro-lat-destino" className="aviso-erro" role="alert" tabIndex={-1}>
                {erros.latDestino}
              </div>
            )}

            <label htmlFor="lng-destino">Longitude</label>
            <input
              id="lng-destino"
              className="entrada"
              type="number"
              step="any"
              aria-required="true"
              aria-invalid={erros.lngDestino ? "true" : "false"}
              aria-describedby={erros.lngDestino ? "erro-lng-destino" : undefined}
              value={form.lngDestino}
              onChange={(e) => setForm((p) => ({ ...p, lngDestino: e.target.value }))}
            />
            {erros.lngDestino && (
              <div id="erro-lng-destino" className="aviso-erro" role="alert" tabIndex={-1}>
                {erros.lngDestino}
              </div>
            )}

            <button
              type="button"
              className="botao-acao"
              onClick={usarLocalizacaoDestino}
              aria-label="Usar minha localização atual como destino"
            >
              Usar minha localização atual
            </button>
          </div>

          <div className="secao-painel" aria-labelledby="titulo-imagem">
            <h4 id="titulo-imagem">Imagem (opcional)</h4>
            <label htmlFor="entrada-arquivo" className="sr-only">Selecionar imagem</label>
            <input
              id="entrada-arquivo"
              className="entrada arquivo-entrada"
              type="file"
              accept="image/*"
              onChange={selecionarImagem}
              aria-label="Selecionar imagem opcional para associar à rota"
            />
            {preview && (
              <div className="area-preview">
                <img src={preview} alt="Pré-visualização da imagem selecionada" className="imagem-preview" tabIndex={0} />
              </div>
            )}
          </div>

          {erroGeo && (
            <div className="aviso-erro" role="alert" tabIndex={-1}>
              {erroGeo}
            </div>
          )}

          <div className="acoes-painel" role="group" aria-label="Ações do formulário">
            <button type="submit" className="botao-gerar">Gerar Rota</button>
          </div>
        </form>
      </div>

      <div id="mapa-geolocalizacao" className="mapa-geolocalizacao" role="region" aria-label="Mapa com rota" tabIndex={0}>
        <p id="descricao-mapa" className="sr-only">
          Mapa interativo mostrando a rota entre origem e destino.
        </p>
      </div>
    </section>
  );
}