import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/NavBar";

describe("Navbar Component", () => {

  test("renders the company name 'Magnet Labs™'", () => {
    render(<Navbar />, { wrapper: MemoryRouter });

    expect(screen.getByText("Magnet Labs™")).toBeInTheDocument();
  });

  test("renders all navigation links", () => {
    render(<Navbar />, { wrapper: MemoryRouter });

    expect(screen.getByText("Our Services")).toBeInTheDocument();
    expect(screen.getByText("Our Work")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  test("navigation links contain correct href attributes", () => {
    render(<Navbar />, { wrapper: MemoryRouter });

    expect(screen.getByText("Our Services")).toHaveAttribute("href", "/services");
    expect(screen.getByText("Our Work")).toHaveAttribute("href", "/work");
    expect(screen.getByText("Contact Us")).toHaveAttribute("href", "/contact");
  });
});
