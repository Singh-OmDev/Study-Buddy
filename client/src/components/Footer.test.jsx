import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

test('renders Footer without crashing', () => {
    const { container } = render(
        <BrowserRouter>
            <Footer />
        </BrowserRouter>
    );
    expect(container).toBeInTheDocument();

    // Check if "Product" section header exists
    expect(screen.getByText('Product')).toBeInTheDocument();
});
