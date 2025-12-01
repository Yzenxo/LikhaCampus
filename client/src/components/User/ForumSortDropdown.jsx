const ForumSortDropdown = ({ sortBy, setSortBy }) => {
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <>
      <div className="flex justify-end p-3">
        <div className="dropdown dropdown-end">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="select select-primary"
          >
            <option disabled={true}>Sort posts</option>
            <option value="trending">Popular</option>
            <option value="newest">Most Recent</option>
            <option value="upvotes">Most Upvoted</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default ForumSortDropdown;
