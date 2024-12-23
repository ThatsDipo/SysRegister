const calculateAverage = (data: number[]) => {
    const total = data.reduce((acc, mark) => acc + mark, 0);
    return (total / data.length).toFixed(3);
};

export default calculateAverage;