interface PreviewHobbyProps {
    hobbies: string;
}

export default function PreviewHobby({ hobbies }: PreviewHobbyProps) {
    if (!hobbies) return null;

    // Split comma-separated hobbies and filter empty items
    const hobbyList = hobbies.split(',').map(h => h.trim()).filter(h => h);

    return (
        <section className="mb-5">
            <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">
                HOBBY
            </h2>
            <ul className="list-disc pl-5 text-sm text-black space-y-1">
                {hobbyList.map((hobby, index) => (
                    <li key={index}>{hobby}</li>
                ))}
            </ul>
        </section>
    );
}
