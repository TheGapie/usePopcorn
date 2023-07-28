const KEY = "d128fe2c";
const query = "rnfrenf";
async function fetchData() {
  try {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`);
    if (!res.ok) throw new Error("Something went wrong while fetching data");
    const data = await res.json();
    console.log(data);
    if (data.Response === "False") throw new Error("Movie Not Found");
    console.log(data);
  } catch (err) {
    console.log(err.message);
  }
}

fetchData();
