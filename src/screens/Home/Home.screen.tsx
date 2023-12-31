import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import styles from './Home.style';
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

export default Home;
