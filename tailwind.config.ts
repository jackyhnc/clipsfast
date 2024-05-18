import { withUt } from "uploadthing/tw";
 
export default withUt({
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
  content: ["./src/**/*.{ts,tsx,mdx}"],
});