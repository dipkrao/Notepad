import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
}

const Home = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<Note>({
    id: '',
    title: '',
    content: '',
    color: '#fff',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Load notes from local storage on component mount
    // Replace with AsyncStorage for more robust storage in a production environment
    const loadNotes = async () => {
      try {
        const storedNotesString = await AsyncStorage.getItem('notes');
        const storedNotes = storedNotesString
          ? JSON.parse(storedNotesString)
          : [];
        setNotes(storedNotes);
      } catch (error) {
        console.error('Error loading notes from AsyncStorage:', error);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    // Save notes to local storage whenever the notes state changes
    AsyncStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    // Filter notes based on search query
    const filtered = notes.filter(
      note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredNotes(filtered);
  }, [notes, searchQuery]);

  const addNote = () => {
    if (newNote.title.trim() === '' && newNote.content.trim() === '') return;

    setNotes(prevNotes => [
      { ...newNote, id: Date.now().toString() },
      ...prevNotes,
    ]);

    setNewNote({ id: '', title: '', content: '', color: '#fff' });
  };

  const editNote = (id: string, title: string, content: string) => {
    console.log('🚀 ~ file: Home.screen.tsx:76 ~ editNote ~ id:', id);
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, title, content } : note,
      ),
    );
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () =>
            setNotes(prevNotes => prevNotes.filter(note => note.id !== id)),
        },
      ],
      { cancelable: true },
    );
  };

  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setSelectedNote(null);
  };

  const saveEditedNote = (editedTitle: string, editedContent: string) => {
    if (selectedNote) {
      editNote(selectedNote.id, editedTitle, editedContent);
      closeEditModal();
    }
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteContainer, { backgroundColor: item.color }]}
      onPress={() => openEditModal(item)}
      onLongPress={() => deleteNote(item.id)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Note App</Text>
      </View>
      <ScrollView>
        <View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
          <FlatList
            data={filteredNotes}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.noteList}
          />
        </View>
        <View style={styles.addNoteContainer}>
          <TextInput
            style={styles.noteTitleInput}
            placeholder="Note Title"
            value={newNote.title}
            onChangeText={text => setNewNote({ ...newNote, title: text })}
          />
          <TextInput
            style={styles.noteContentInput}
            placeholder="Note Content"
            multiline
            value={newNote.content}
            onChangeText={text => setNewNote({ ...newNote, content: text })}
          />
          <TouchableOpacity style={styles.addNoteButton} onPress={addNote}>
            <Text style={styles.addNoteButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeEditModal}>
        <View style={styles.modalContainer}>
          <View
            style={{
              backgroundColor: 'white',
              width: 380,
              alignItems: 'center',
              padding: 20,
              paddingHorizontal: 0,
            }}>
            <TextInput
              style={styles.modalInput}
              placeholder="Edit Title"
              value={selectedNote?.title}
              onChangeText={text =>
                setSelectedNote(prev => ({ ...prev, title: text }))
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Edit Content"
              multiline
              value={selectedNote?.content}
              onChangeText={text =>
                setSelectedNote(prev => ({ ...prev, content: text }))
              }
            />
            <Pressable
              style={styles.modalButton}
              onPress={() =>
                saveEditedNote(
                  selectedNote?.title || '',
                  selectedNote?.content || '',
                )
              }>
              <Text style={styles.modalButtonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={closeEditModal}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  noteList: {
    flexGrow: 1,
  },
  noteContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addNoteContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 16,
  },
  noteTitleInput: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  noteContentInput: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: 100,
  },
  addNoteButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  addNoteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchInput: {
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalInput: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    width: '80%',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
    width: '80%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Home;
