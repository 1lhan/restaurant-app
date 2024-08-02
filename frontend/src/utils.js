export const usePostRequest = async (url, requestBody) => {
    let request = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    }).then(res => res.json())

    return request
}

export const useFormatDate = (dateString) => {
    // Tarih stringini Date nesnesine dönüştür
    const date = new Date(dateString);

    // Gün, ay ve yıl bilgilerini alın
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğundan +1 ekliyoruz
    const year = date.getFullYear();

    // Saat ve dakika bilgilerini alın
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // İstenen formatta birleştirin
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export const calculateLastDayOfMonth = () => {
    let _date = new Date()
    let _lastDayOfMonth = new Date(new Date(_date.getFullYear(), _date.getMonth() + 1, 1) - (1000 * 60 * 60 * 24))
    let _formattedLastDayOfMonth = `${_lastDayOfMonth.getFullYear()}-${String(_lastDayOfMonth.getMonth() + 1).padStart(2, '0')}-${String(_lastDayOfMonth.getDate()).padStart(2, '0')}`
    return _formattedLastDayOfMonth
}