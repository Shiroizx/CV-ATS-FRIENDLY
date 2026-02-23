declare module "html2pdf.js" {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: { type?: "jpeg" | "png" | "webp"; quality?: number };
        html2canvas?: Record<string, unknown>;
        jsPDF?: Record<string, unknown>;
        pagebreak?: Record<string, unknown>;
    }

    interface Html2PdfInstance {
        set(opt: Html2PdfOptions): Html2PdfInstance;
        from(element: HTMLElement): Html2PdfInstance;
        save(): Promise<void>;
        toPdf(): Html2PdfInstance;
        toCanvas(): Html2PdfInstance;
        toImg(): Html2PdfInstance;
        output(type: string): Promise<unknown>;
    }

    function html2pdf(): Html2PdfInstance;
    export default html2pdf;
}
