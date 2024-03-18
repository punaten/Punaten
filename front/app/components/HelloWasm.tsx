import { useEffect, useState } from 'react';

const HelloWasm = () => {
    const [wasmModule, setWasmModule] = useState<WebAssembly.Exports | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            try {
                const wasm = await WebAssembly.instantiateStreaming(
                    fetch('/hello.wasm'), // パブリックディレクトリに配置した`.wasm`ファイルへのパス
                    {}
                );
                setWasmModule(wasm.instance.exports);
            } catch (err) {
                console.error('Failed to load wasm:', err);
            }
        };

        loadWasm();
    }, []);

    return (
        <div>
            <h1>WebAssembly Example</h1>
            {wasmModule && <p>Result: {wasmModule.add(1,2)}</p>}
        </div>
    );
};

export default HelloWasm;
