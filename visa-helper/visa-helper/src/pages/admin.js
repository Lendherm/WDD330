export function AdminPage() {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const rows = users.map(
    (u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.status || "Pendiente"}</td>
      </tr>
    `
  ).join("");

  return `
    <section class="admin">
      <h2>Panel de Administración</h2>
      <p>Revisa los registros de usuarios que solicitaron ayuda.</p>
      <table>
        <thead>
          <tr><th>#</th><th>Nombre</th><th>Correo</th><th>Estado</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}
