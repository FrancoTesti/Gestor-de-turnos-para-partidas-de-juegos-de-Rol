import { render, screen } from "@testing-library/react";
import UsuarioDetalle from "../UsuarioDetalle";

const usuarioMock = {
  idUsuario: 1,
  nombreUsuario: "Test User",
  imagen: "",
  nickname: "tester",
};

describe("UsuarioDetalle", () => {
  it("mantiene el orden de hooks al cambiar de detalle a estado de carga", () => {
    const { rerender } = render(<UsuarioDetalle usuario={usuarioMock} />);

    rerender(<UsuarioDetalle usuario={usuarioMock} cargando />);

    expect(
      screen.getByText("Cargando información del usuario..."),
    ).toBeInTheDocument();
  });
});
