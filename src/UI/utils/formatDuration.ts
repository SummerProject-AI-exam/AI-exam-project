export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
        return `${minutes} mins`
    }

    if (remainingMinutes === 0) {
        return `${hours} hr${hours > 1 ? 's' : ''}`
    }

    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} mins`
}