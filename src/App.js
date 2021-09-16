import CustomReact from './CustomReact';
import Item from './Item';

/** @jsx CustomReact.createElement */
function App({ title }) {
  const [text, setText] = CustomReact.useState('initial text');
  const [todos, setTodos] = CustomReact.useState([]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos(state => [...state, { id: Date.now(), text }]);
    setText('');
  }

  return (
    <div style="display:flex;flex-direction:column;gap:1em;align-items:flex-start;max-width:90%;margin:1rem auto;">
      <h1>
        { title }
      </h1>
      <form onSubmit={onSubmit}>
        <input 
          value={text} 
          onInput={({ target: { value }}) => setText(value)} 
          style="height:2em;border-radius:8px;padding:4px;box-sizing:border-box;"
        />
        <button 
          type="submit"
          style="height:2em;border-radius:8px;padding:4px;box-sizing:border-box;"
        >
          Add todo
        </button>
      </form>
      { todos.map(item => <Item {...item} />) }
    </div>
  );
}; 

export default App;