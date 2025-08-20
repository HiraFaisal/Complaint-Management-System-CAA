import React, { useState } from "react";
const Test = () => {
  const [name, setName] = useState("irma");
  const [age, setAge] = useState(25);
  const changename = name === "irma" ? "hehe" : "irma";
  const [object, setObject] = useState([
    { name: "irma", age: 20 },
    { name: "hehe", age: 23 },
  ]);
  return (
    <>
      <div>my name is {name}</div>
      <button onClick={() => setName(changename)}>click here</button>
      <div>
        <table className="border border-black">
          <thead className="border border-black">
            <th>Name</th>
            <th>Age</th>
          </thead>
          <tbody className="border border-black">
            {object.map((Arrayobject, index) => (
              <tr key={index}>
                <td>{Arrayobject.name} </td>
                <td> {Arrayobject.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form className="flex flex-col gap-2 max-w-48 ">
          <input
            onChange={(e) => setObject([{ name: e.target.value }])}
            type="text"
            className="border border-black"
            placeholder="Enter name"
          />
          <input
            onChange={(e) => setObject([{ age: e.target.value }])}
            type="number"
            className="border border-black"
            placeholder="Enter age"
          />
          <button type="submit" className="bg-black text-white">
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default Test;
