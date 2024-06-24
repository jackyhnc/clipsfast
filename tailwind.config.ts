import { withUt } from "uploadthing/tw";
 
export default withUt({
  theme: {
    extend: {
      animation: {
        'infinite-scroll': 'infinite-scroll 20s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
            from: { transform: 'translateY(0)' },
            to: { transform: 'translateY(-100%)' },
        }
      },
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