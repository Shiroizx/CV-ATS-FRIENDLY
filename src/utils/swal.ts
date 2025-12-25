import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration for modern, animated alerts
const SwalConfig = {
    // Default configuration
    showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
        backdrop: 'animate__animated animate__fadeIn'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
        backdrop: 'animate__animated animate__fadeOut'
    },
    customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-2xl font-bold',
        htmlContainer: 'text-base',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105',
        cancelButton: 'px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105',
        actions: 'gap-3'
    },
    buttonsStyling: false,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
};

// Success Alert
export const showSuccess = (title: string, text?: string, timer = 2000) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        timer,
        showConfirmButton: timer ? false : true,
        confirmButtonText: 'OK',
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-green-600 hover:bg-green-700 text-white`,
        }
    });
};

// Error Alert
export const showError = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'OK',
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-red-600 hover:bg-red-700 text-white`,
        }
    });
};

// Warning Alert
export const showWarning = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'OK',
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-orange-600 hover:bg-orange-700 text-white`,
        }
    });
};

// Info Alert
export const showInfo = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonText: 'Mengerti',
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-blue-600 hover:bg-blue-700 text-white`,
        }
    });
};

// Confirmation Dialog
export const showConfirm = (
    title: string,
    text: string,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal'
) => {
    return Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-blue-600 hover:bg-blue-700 text-white`,
            cancelButton: `${SwalConfig.customClass.cancelButton} bg-gray-200 hover:bg-gray-300 text-gray-700`,
        }
    });
};

// Delete Confirmation
export const showDeleteConfirm = (
    title = 'Apakah Anda yakin?',
    text = 'Data yang dihapus tidak dapat dikembalikan!'
) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        ...SwalConfig,
        customClass: {
            ...SwalConfig.customClass,
            confirmButton: `${SwalConfig.customClass.confirmButton} bg-red-600 hover:bg-red-700 text-white`,
            cancelButton: `${SwalConfig.customClass.cancelButton} bg-gray-200 hover:bg-gray-300 text-gray-700`,
        }
    });
};

// Loading Alert
export const showLoading = (title = 'Memproses...', text?: string) => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        ...SwalConfig,
    });
};

// Toast (small notification)
export const showToast = (
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    timer = 3000
) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        showClass: {
            popup: 'animate__animated animate__fadeInRight animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutRight animate__faster'
        }
    });

    return Toast.fire({
        icon,
        title
    });
};

export default Swal;
