import React, { useState, useCallback, useEffect, useRef } from "react";
import type { ToolBarProps } from "./ToolBar.types";

// Custom hook para debouncing
const useDebounce = (callback: (searchTerm: string) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);

    const debouncedCallback = useCallback((searchTerm: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Configura el nuevo temporizador
        timeoutRef.current = setTimeout(() => {
            callback(searchTerm);
        }, delay) as unknown as number; 

    }, [callback, delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
};


function ToolBar({ titulo, onSearch, onRegister }: ToolBarProps) {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    
    const debouncedSearch = useDebounce(onSearch, 500);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLocalSearchTerm(value);
        debouncedSearch(value);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            
            if (e.currentTarget.value) {
                
                onSearch(e.currentTarget.value);
            } else {
               
                onSearch('');
            }
        }
    };


    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-5 mt-5 p-4 bg-white shadow-md rounded-lg border border-gray-400">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">{titulo}</h1>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full md:min-w-68">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={localSearchTerm}
                        onChange={handleInputChange} // Usamos el nuevo handler con debounce
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-2 border border-gray-400 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-search text-gray-600"
                            viewBox="0 0 16 16"
                        >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>
                    </div>
                </div>

                <button
                    onClick={onRegister}
                    className="btn text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center space-x-2 px-4 py-2"
                >
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-plus-circle-fill"
                        viewBox="0 0 16 16"
                    >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                    </svg>
                    <span>Registrar Nuevo</span>
                </button>
            </div>
        </div>
    );
}

export default ToolBar;
