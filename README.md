# FRC Team 1912 Website

A modern, responsive website for FRC Team 1912 built with HTML, CSS, and JavaScript.

## Features

- Modern and responsive design
- Smooth scrolling animations
- Interactive navigation
- Parallax effects
- Mobile-friendly layout
- Section-based content organization

## Project Structure

```
1912website/
├── index.html          # Main HTML file
├── css/
│   ├── style.css      # Main styles
│   └── animations.css # Animation styles
├── js/
│   └── main.js        # JavaScript functionality
├── images/            # Image assets (create this directory)
└── README.md         # Project documentation
```

## Setup Instructions

1. Clone this repository
2. Create an `images` directory and add your team's images
3. Replace the placeholder content in `index.html` with your team's content
4. Customize colors in `css/style.css` (look for the `:root` section)
5. Test the website locally by opening `index.html` in a web browser

## Customization

### Colors
You can customize the color scheme by modifying the CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #1e88e5;
    --secondary-color: #ff4081;
    --dark-color: #1a1a1a;
    --light-color: #ffffff;
    --gray-color: #f5f5f5;
}
```

### Content Sections
The website is organized into sections:
- Home (Hero)
- About
- Team
- Robots
- Contact

Each section can be customized in `index.html` by modifying the content within the respective `<section>` tags.

### Images
1. Create an `images` directory
2. Add your team photos, robot images, and a hero background image
3. Update the image paths in the HTML and CSS files

## Dependencies

- [ScrollReveal](https://scrollrevealjs.org/) - For scroll animations

## Browser Support

The website is compatible with modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License. 

## Deploy from production

 Uses Github Action to deploy (on push to) the production branch
