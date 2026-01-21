const generatePaginationJSON = (pageNumber, totalCount, pageSize) => {
  return {
    paginationInfo: {
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil(totalCount / pageSize)),
      totalCount: Number(totalCount),
      pageSize: Number(pageSize),
    },
  };
};

module.exports = {
  generatePaginationJSON,
};
