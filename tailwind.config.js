module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: '#6366F1',    // Brand purple
                secondary: '#22C55E',  // CTA green
                dark: '#0F172A',       // Background dark
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
