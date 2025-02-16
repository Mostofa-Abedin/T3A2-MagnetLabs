import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "../components/heroSection/heroSection";
import "@testing-library/dom";

describe("HeroSection Component", () => {
  test("renders the hero section correctly", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    // Check if the heading is present
    const heading = screen.getByTestId("hero-title");
    expect(heading).toHaveTextContent(/THE ART OF DIGITAL ATTRACTION/i);

    // Check if the video is present
    const video = container.getElementsByTagName("video")[0];
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("autoPlay");
    expect(video).toHaveAttribute("loop");
  });

  test("renders floating icons", () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    const floatingIcons = screen.getAllByRole("img"); 
    expect(floatingIcons.length).toBeGreaterThan(0);

    floatingIcons.forEach((icon) => {
      expect(icon).toBeVisible();
    });
  });

  test("ensures all essential elements are visible", () => {
    render(<HeroSection />);

    // Check if the overlay content is visible
    expect(screen.getByText(/We craft solutions that/i)).toBeVisible();
  });
});