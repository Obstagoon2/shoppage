document.addEventListener('DOMContentLoaded', () => {
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'robot-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'robot-modal';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'robot-modal-close';
    closeButton.innerHTML = '×';
    
    modalContent.appendChild(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Set up Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '50px',  // Start loading slightly before elements come into view
        threshold: 0.15      // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('animate');
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    // Start observing all robot cards
    document.querySelectorAll('.robot-card').forEach(card => {
        observer.observe(card);
    });
    
    // Add click handlers to all robot cards
    document.querySelectorAll('.robot-card').forEach(card => {
        card.addEventListener('click', () => {
            const robotName = card.querySelector('h2').textContent;
            const robotGame = card.querySelector('h3').textContent;
            const robotImage = card.querySelector('img').src;
            const robotSpecs = Array.from(card.querySelectorAll('.specs h4, .specs p')).map(el => el.textContent);
            
            // Create modal content
            modalContent.innerHTML = `
                <button class="robot-modal-close">×</button>
                <div class="robot-modal-content">
                    <div class="robot-modal-image">
                        <img src="${robotImage}" alt="${robotName}">
                    </div>
                    <div class="robot-modal-info">
                        <h2>${robotName}</h2>
                        <h3>${robotGame}</h3>
                        <div class="robot-modal-specs">
                            ${createSpecsHTML(robotSpecs)}
                        </div>
                    </div>
                </div>
            `;
            
            // Show modal with animation
            modalOverlay.classList.add('active');
            setTimeout(() => modalContent.classList.add('active'), 10);
            
            // Add close button handler
            modalContent.querySelector('.robot-modal-close').addEventListener('click', closeModal);
        });
    });
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close modal when pressing ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    function closeModal() {
        modalContent.classList.remove('active');
        setTimeout(() => modalOverlay.classList.remove('active'), 300);
    }
    
    function createSpecsHTML(specs) {
        let html = '';
        if (specs.length === 0) {
            return html;
        }
        // If all specs are just paragraphs (no h4s), show as a block
        if (specs.length === 1) {
            html += `<div class="spec-item"><p>${specs[0]}</p></div>`;
        } else if (specs.length % 2 === 0) {
            // Usual h4/p pairs
            for (let i = 0; i < specs.length; i += 2) {
                if (specs[i] && specs[i + 1]) {
                    html += `
                        <div class="spec-item">
                            <h4>${specs[i]}</h4>
                            <p>${specs[i + 1]}</p>
                        </div>
                    `;
                }
            }
        } else {
            // If odd number, treat all as paragraphs
            html += '<div class="spec-item">';
            for (let i = 0; i < specs.length; i++) {
                html += `<p>${specs[i]}</p>`;
            }
            html += '</div>';
        }
        return html;
    }
}); 