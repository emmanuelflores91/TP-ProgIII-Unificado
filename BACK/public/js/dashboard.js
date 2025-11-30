function crearTabla(data) 
{
  if (!Array.isArray(data) || data.length === 0) return document.createTextNode('No hay datos');

  const tabla = document.createElement("table");
  tabla.appendChild(crearCabecera(data[0]));
  tabla.appendChild(crearCuerpo(data));

  return tabla;
}

function crearCabecera(elemento) 
{
  const tHead = document.createElement("thead");

  const headRow = document.createElement("tr");

    for (const key in elemento) 
    {
        const th = document.createElement("th");
        th.textContent = key;
        headRow.appendChild(th);
    }

  tHead.appendChild(headRow);

  return tHead;
}

function crearCuerpo(data) 
{
  if (!Array.isArray(data)) return null;

  const tBody = document.createElement("tbody");

    data.forEach((element) => 
    {
        const tr = document.createElement("tr");
        tr.classList.add("clickable");

      // asignar id para selección (asume key "id" o "ID")
      const idKey = Object.keys(element).find(k => k.toLowerCase() === 'id') ?? Object.keys(element)[0];
      tr.dataset.id = element[idKey];

        for (const key in element) 
        {
            const td = document.createElement("td");
            td.textContent = element[key];
            tr.appendChild(td);

        }

        tBody.appendChild(tr);
    });

  return tBody;
}

export const actualizarTabla = (contenedor, data) => 
{
    while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
    contenedor.appendChild(crearTabla(data));

    // añadir handler de selección (delegation)
    contenedor.addEventListener('click', (ev) => {
      const tr = ev.target.closest('tr.clickable');
      if (!tr) return;
      // quitar selected previo
      const prev = contenedor.querySelector('tr.selected');
      if (prev) prev.classList.remove('selected');
      tr.classList.add('selected');
      // dispatch evento custom con id seleccionado
      const id = tr.dataset.id;
      contenedor.dispatchEvent(new CustomEvent('rowSelected', { detail: { id } }));
    });
};

