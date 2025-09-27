export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <h3 className="text-xl font-bold">Duc Nguyen</h3>
        </div>
        <div className="flex justify-center space-x-6 mb-4">
          <a href="mailto:duc.tri.nguyen0186@gmail.com" className="hover:text-blue-400">Email</a>
          <a href="https://www.linkedin.com/in/duc-nguyen-33716b1b6/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">LinkedIn</a>
          <a href="https://github.com/ductringuyen0186" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">GitHub</a>
        </div>
        <p className="text-gray-400"> 2024 Duc Nguyen. All rights reserved.</p>
      </div>
    </footer>
  );
}
