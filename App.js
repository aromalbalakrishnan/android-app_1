// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Hi There!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, ImageBackground } from "react-native";

export default function App() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDetails, setBookDetails] = useState({});
  const [bookImage, setBookImage] = useState("");
  const [showBooks, setShowBooks] = useState(false); // State to track button click

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const makeApiCall = () => {
    setBookDetails({});
    setBookImage("");
    setShowBooks(true); // Set showBooks to true when button is clicked
    
    const formattedBookTitle = bookTitle.trim().replace(/ /g, '%');
    const formattedBookAuthor = bookAuthor.trim().replace(/ /g, '%');
    
    const query = formattedBookTitle && formattedBookAuthor? `intitle:${encodeURIComponent(formattedBookTitle)}+inauthor:${encodeURIComponent(formattedBookAuthor)}`
        : formattedBookTitle? `intitle:${encodeURIComponent(formattedBookTitle)}`
        : formattedBookAuthor? `inauthor:${encodeURIComponent(formattedBookAuthor)}`
        : "";

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        // handleResponse(data);
        setBooks(data.items || [])        
      })
      .catch((error) => { 
        console.error(error);
        setShowBooks(false);
      });
  };

  // Function to fetch additional details of the clicked book
  const fetchBookDetails = (bookId) => {
    fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
      .then((response) => response.json())
      .then((data) => {
        setBookDetails(data.volumeInfo || {}); // Store additional details
        setModalVisible(true); // Show modal with additional details
      })
      .catch((error) => console.error(error));
  };

  const renderBooks = () => {
    return books.map((book, index) => {
      const volumeInfo = book.volumeInfo;
      const title = volumeInfo.title;// || "Title not available";
      const subtitle = volumeInfo.subtitle || undefined;//"Subtitle not available";
      const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Author not available";
      const thumbnail = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "";
      const price = book.saleInfo && book.saleInfo.retailPrice ? `${book.saleInfo.retailPrice.amount} ${book.saleInfo.retailPrice.currencyCode}` : "Price not available";
      // const industryIdentifiers = book.industryIdentifiers;
    //   if (book.industryIdentifiers && book.industryIdentifiers.length > 0) {
    //     const isbn = book.industryIdentifiers[0].identifier;
    //     // Use isbn variable here
    // }
    // const isbn = book.industryIdentifiers.length > 0 ? book.industryIdentifiers[0].identifier: null;

      const bookId = book.id;

      return (
        // TouchableOpacity added to make each book view clickable
        <TouchableOpacity key={index} style={styles.bookContainer} onPress={() => fetchBookDetails(bookId)}>
          {thumbnail && (
            <Image
              source={{ uri: thumbnail }}
              style={styles.image}
             />
            )}
          {/* <Image source={{ uri: thumbnail }} style={styles.image} accessibilityLabel="Book Cover Image"/> */}
          <View style={styles.bookDetails}>
            <Text>Title: {title}</Text>
            {subtitle &&
            <Text>Subtitle: {subtitle}</Text> }
            <Text>Author: {authors}</Text>
            <Text>Price: {price}</Text>
            {/* { isbn != undefined ?<Text>ISBN: {isbn}</Text> : null }  */}
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Book Title"
        onChangeText={(text) => setBookTitle(text)}
        value={bookTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Book Author"
        onChangeText={(text) => setBookAuthor(text)}
        value={bookAuthor}
      />
      <Button title="Search" onPress={makeApiCall} />
      {/* {bookImage ? (
        <Image source={{ uri: bookImage }} style={styles.image} />
      ) : null}
       {bookDetails.title === 'No books found' ? (
        <View style={styles.bookDetails}>
          <Text>{bookDetails.title}</Text>
        </View>
      ) : bookDetails.title ? ( // Check if bookDetails.title exists
        <View style={styles.bookDetails}>
          <Text>Title: {bookDetails.title}</Text>
          <Text>Sub Title: {bookDetails.subtitle}</Text>
          <Text>Author: {bookDetails.author}</Text>
          <Text>Price: {bookDetails.price}</Text>
        </View>
      ) : null}  */}
      {/* Conditionally render ScrollView based on showBooks state */}
      {showBooks && (
        <ScrollView style={styles.scrollView}>
          {renderBooks()}
        </ScrollView>
      )}
      {/* Modal to display additional book details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          {/* Conditional rendering of Image component */}
          {bookDetails.imageLinks && bookDetails.imageLinks.thumbnail && (
            <Image
              source={{ uri: bookDetails.imageLinks.thumbnail }}
              style={styles.modalImage}
             />
            )}
            {/* <ImageBackground>{bookDetails.imageLinks.thumbnail ? bookDetails.imageLinks.thumbnail : null}</ImageBackground> */}
            <Text>Title: {bookDetails.title}</Text>
            {bookDetails.subtitle && <Text>Subtitle: {bookDetails.subtitle}</Text> }
            <Text>Author: {bookDetails.authors}</Text>
            <Text>Publisher: {bookDetails.publisher}</Text> 
            <Text>Publish Date: {bookDetails.publishedDate}</Text> 
            {bookDetails.industryIdentifiers &&
            bookDetails.industryIdentifiers.length > 0 && (
            <Text>ISBN No:{" "}{bookDetails.industryIdentifiers[0].identifier}{" "}</Text>
            )}
            {/* Add other details as needed */}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6E6FA",
    padding: 20,
    marginTop: 35,
  },
  input: {
    width: "80%",
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  scrollView: {
    width: "100%",
    // display: "none",
  },
  bookContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  bookDetails: {
    flex: 1,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxWidth: "80%", // Set maximum width to 80% of the screen width
    maxHeight: "80%", // Set maximum height to 80% of the screen height
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  modalImage: {
    width: 200, // Adjust width as needed
    height: 300, // Adjust height as needed
    resizeMode: "cover", // or "contain" based on your preference
    marginBottom: 10, // Add margin bottom for spacing
    justifyContent: "center",
    alignItems: "center"
  },
});