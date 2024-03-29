//"use strict";//learned from https://www.w3schools.com/js/js_strict.asp
// import logo from './logo.svg';
// import '@aws-amplify/ui-react/styles.css';
// import {
//   withAuthenticator,
//   Button,
//   Heading,
//   Image,
//   View,
//   Card,
// } from '@aws-amplify/ui-react';
//
// function App({signOut}) {
//   return (
//     <View className="App">
//       <Card>
//         <Image src={logo} className="App-logo" alt="logo" />
//         <Heading level={1}>
//           We now have auth!
//         </Heading>
//       </Card>
//       <Button onClick={signOut}>sign out</Button>
//     </View>
//   );
// }

import {Component} from 'react';
import Amplify, {API,graphqlOperation} from 'aws-amplify';
import {createNote,deleteNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';

import {withAuthenticator,Authenticator} from '@aws-amplify/ui-react';
import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsExports);

class AddNote extends Component{
  constructor(props){
    super(props);
    this.state={text:''};
  }

  handleChange=(event)=>{
    this.setState({text:event.target.value});
  }

  handleClick=()=>{
    this.props.addNote(this.state);
    this.setState({text:''});
  }

  render(){
    return (
      <div style={styles.form}>
        <input
          value={this.state.text}
          onChange={this.handleChange}
          placeHolder="new note"
          style={styles.input}
        />
        <button onClick={this.handleClick} style={styles.addButton}>add note</button>
      </div>
    );
  }
}

class NotesList extends Component{
  render(){
    return (
      <div>
        {this.props.notes.map(note=>
          <div key={note.id} style={styles.note}>
            <p>{note.text}</p>
            <button onClick={()=>{this.props.deleteNote(note)}} style={styles.deleteButton}>x</button>
          </div>
        )}
      </div>
    );
  }
}

class App extends Component{
  constructor(props){
    super(props);
    this.state={notes:[]};
  }

  async componentDidMount() {
    var result=await API.graphql(graphqlOperation(listNotes));
    this.setState({notes:result.data.listNotes.items});
  }

  deleteNote=async (note)=>{
    const id={
      id:note.id
    };
    await API.graphql(graphqlOperation(deleteNote,{input:id}));
    this.setState({notes:this.state.notes.filter(item=>item.id!==note.id)});
  }

  addNote=async (note)=>{
    var result=await API.graphql(graphqlOperation(createNote,{input:note}));
    this.state.notes.push(result.data.createNote);
    this.setState({notes:this.state.notes});
  }

  render(){
    return (
      <Authenticator>
        {({signOut,user})=>(
          <div style={styles.container}>
            <h1>{user.username}'s notes app</h1>
            <AddNote addNote={this.addNote} />
            <NotesList notes={this.state.notes} deleteNote={this.deleteNote} />
            <button onClick={signOut} style={styles.signOutButton}>sign out</button>
          </div>
        )}
      </Authenticator>
    );
  }
}

export default withAuthenticator(App);

const styles={
  container:{width:480,margin:'0 auto', padding:20},
  form:{display:'flex',marginBottom:15},
  input:{flexGrow:2,border:'none',backgroundColor:'#ddd',padding:12,fontSize:18},
  addButton:{backgroundColor:'black',color:'white',outline:'none',padding:12,fontSize:18},
  signOutButton:{backgroundColor:'green',color:'white',width:420,padding:12,fontSize:17},
  note:{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:22,marginBottom:15},
  deleteButton:{fontSize:18,fontWeight:'bold'}
}
