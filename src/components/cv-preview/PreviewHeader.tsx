interface PreviewHeaderProps {
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolio: string;
    address: string;
}

export default function PreviewHeader({
    fullName,
    phone,
    email,
    linkedin,
    portfolio,
    address,
}: PreviewHeaderProps) {
    const contactItems: string[] = [];
    if (phone) contactItems.push(phone);
    if (email) contactItems.push(email);
    if (linkedin) contactItems.push(linkedin);
    if (portfolio) contactItems.push(portfolio);

    return (
        <header className="text-center border-b border-black pb-4 mb-5">
            <h1 className="text-2xl md:text-[26px] font-bold text-black uppercase tracking-wide mb-2">
                {fullName || 'NAMA LENGKAP'}
            </h1>

            {contactItems.length > 0 && (
                <p className="text-sm text-black mb-1">
                    {contactItems.join('  |  ')}
                </p>
            )}

            {address && (
                <p className="text-sm text-black">{address}</p>
            )}
        </header>
    );
}
