import './App.css'
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient.js";
import { useState, useEffect } from "react";
import doubleArrow from './assets/double_arrow_svg.svg'
import heroVideo from './assets/travelhub_hero_loop_v2_1080p.mp4'
import hillsPoster from './assets/hills.jpg'
import searchIcon from './assets/search_red.svg'
import locationIcon from './assets/location.svg'
import thumbUpIcon from './assets/thumb_up.svg'
import airplaneIcon from './assets/airplane.svg'
import beachImage from './assets/beach.png'
import pakistanImage from './assets/post-images/QUAID_E_AZAM_PUBLIC_LIBRARY_LAHORE.jpg'
import alaskaImage from './assets/post-images/skagway-train.jpg'
import newYorkImage from './assets/post-images/new-york.jpg'

const examplePosts = [
  {
    id: "example-pakistan",
    title: "Markets, Malls, and a Traveling Across Pakistan",
    destination: "Pakistan",
    author: "Zainab A.",
    description:
      "I visited several cities across Pakistan, including Karachi, Lahore, and Islamabad. One of my favorite stops was a Harry Potter-themed café in Islamabad. I also spent a lot of time shopping in local markets and had a formal dress custom-made by choosing the fabric, colors, design, and measurements myself. I recommend visiting Badshahi Mosque, Haveli Restaurant for its view of the mosque, Dolmen Mall, and Quaid-e-Azam Library.",
    image_url: pakistanImage,
    upvotes: 0,
    created_at: "2026-08-03T12:00:00",
  },

  {
    id: "example-alaska",
    title: "Orcas and Mountain Views in Alaska",
    destination: "Alaska, United States",
    author: "Zainab A.",
    description:
      "I traveled to Alaska on a cruise that began in Washington. Before the cruise, we saw Mount Rainier, and once we reached Alaska, we spotted many orcas in the water. We stopped in cities including Skagway, Ketchikan, and Juneau. One of the most memorable parts of the trip was taking the scenic train ride from Skagway through the mountains.",
    image_url: alaskaImage,
    upvotes: 0,
    created_at: "2026-08-02T12:00:00",
  },

  {
    id: "example-new-york",
    title: "New York Places I Recommend",
    destination: "New York City, New York",
    author: "Zainab A.",
    description:
      "During my trip to New York City, I visited The Metropolitan Museum of Art, Times Square, the Harry Potter store, and the Empire State Building. I also rode the Roosevelt Island Tramway, which provided great views of the city. The tramway and the Empire State Building are both excellent choices for seeing the New York skyline.",
    image_url: newYorkImage,
    upvotes: 0,
    created_at: "2026-08-01T12:00:00",
  },
];

const EXAMPLE_UPVOTES_KEY = "travel-hub-example-upvotes";

const getSavedExampleUpvotes = () => {
  try {
    return JSON.parse(localStorage.getItem(EXAMPLE_UPVOTES_KEY)) || {};
  } catch {
    return {};
  }
};

const getExamplePostsWithSavedUpvotes = () => {
  const savedUpvotes = getSavedExampleUpvotes();

  return examplePosts.map((post) => ({
    ...post,
    upvotes: savedUpvotes[post.id] ?? post.upvotes,
  }));
};

const saveExampleUpvotes = (postId, upvotes) => {
  const savedUpvotes = getSavedExampleUpvotes();

  localStorage.setItem(
    EXAMPLE_UPVOTES_KEY,
    JSON.stringify({ ...savedUpvotes, [postId]: upvotes })
  );
};

const POST_IMAGES_BUCKET = "post-images";

const uploadPostImage = async (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(POST_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return { imageUrl: data.publicUrl, filePath };
};

const removeUploadedImage = async (filePath) => {
  if (filePath) {
    await supabase.storage.from(POST_IMAGES_BUCKET).remove([filePath]);
  }
};


const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">
        <img className="airplane-icon" src={airplaneIcon} alt="" />
        home
      </Link>

      <Link to="/create" className="nav-link">
        + create post
      </Link>
    </nav>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const Home = () => {

  // empty variable to hold the posts fetched from Supabase
  const [posts, setPosts] = useState(getExamplePostsWithSavedUpvotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("upvotes");
  const [dateOrder, setDateOrder] = useState("newest");
  const [popularityOrder, setPopularityOrder] = useState("most");

  // useEffect hook to fetch posts from Supabase when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) { // If Supabase reports an error
        console.error("Error fetching posts:", error);
        return;
      }

      setPosts([...data, ...getExamplePostsWithSavedUpvotes()]);
    };

    fetchPosts(); // Call the fetchPosts function to fetch posts from Supabase
  }, []);

  const handleHomeUpvote = async (event, post) => {
    event.preventDefault();
    event.stopPropagation();

    const updatedUpvotes = post.upvotes + 1;

    if (String(post.id).startsWith("example-")) {
      saveExampleUpvotes(post.id, updatedUpvotes);
    } else {
      const { error } = await supabase
        .from("posts")
        .update({ upvotes: updatedUpvotes })
        .eq("id", post.id);

      if (error) {
        console.error("Error updating upvotes:", error);
        return;
      }
    }

    setPosts((currentPosts) =>
      currentPosts.map((currentPost) =>
        currentPost.id === post.id
          ? { ...currentPost, upvotes: updatedUpvotes }
          : currentPost
      )
    );
  };

  const handleDateSort = () => {
    setDateOrder((currentOrder) =>
      currentOrder === "newest" ? "oldest" : "newest"
    );
    setSortBy("date");
  };

  const handlePopularitySort = () => {
    setPopularityOrder((currentOrder) =>
      currentOrder === "most" ? "least" : "most"
    );
    setSortBy("upvotes");
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visiblePosts = posts
    .filter((post) => {
      if (!normalizedSearch) {
        return true;
      }

      return [post.title, post.author, post.destination, post.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    })
    .sort((firstPost, secondPost) => {
      if (sortBy === "date") {
        const firstDate = new Date(firstPost.created_at).getTime();
        const secondDate = new Date(secondPost.created_at).getTime();

        return dateOrder === "newest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      }

      const firstUpvotes = Number(firstPost.upvotes) || 0;
      const secondUpvotes = Number(secondPost.upvotes) || 0;

      return popularityOrder === "most"
        ? secondUpvotes - firstUpvotes
        : firstUpvotes - secondUpvotes;
    });

  return (
      <div className="page">
        <main>
          {/* Hero */}
          <section className="hero">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={hillsPoster}
              aria-hidden="true"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>

            <div className="hero-text">
              <h1>the travel hub</h1>
              <p>stories, tips, and places worth the trip</p>
            </div>

            <a href="#posts" className="scroll-cue" aria-label="Scroll to posts">
              <img src={doubleArrow} alt="" />
            </a>
          </section>

          {/* Posts section */}
          <section className="posts-section" id="posts">
            <div className="posts-heading">
              <h2>posts</h2>
              <p>from around the world</p>
            </div>

            {/* Search and sorting */}
            <div className="filters">
              <div className="search-area">
                <label htmlFor="search">search</label>

                <div className="search-box">
                  <img
                    className="search-icon"
                    src={searchIcon}
                    alt=""
                  />

                  <input
                    id="search"
                    type="text"
                    placeholder="Search posts"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="filter-area">
                <label>date</label>

                <button
                  type="button"
                  className={`filter-button ${sortBy === "date" ? "active" : ""}`}
                  onClick={handleDateSort}
                >
                  <span>⇅</span>
                  {dateOrder === "newest" ? "Newest First" : "Oldest First"}
                </button>
              </div>

              <div className="filter-area">
                <label>upvotes</label>

                <button
                  type="button"
                  className={`filter-button ${sortBy === "upvotes" ? "active" : ""}`}
                  onClick={handlePopularitySort}
                >
                  <span>⇅</span>
                  {popularityOrder === "most" ? "Most Popular" : "Least Popular"}
                </button>
              </div>
            </div>

            {/* Travel posts */}
            <div className="post-list">
              {visiblePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="post-link"
                >
                  <article className="post-card">
                    <div className="post-top-row">
                      <h3>{post.title}</h3>

                      <p className="post-date">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="post-details">
                      <p>
                        <img
                          className="post-detail-icon"
                          src={locationIcon}
                          alt=""
                        />

                        {post.destination}
                      </p>

                      <button
                        type="button"
                        className="post-upvote-button"
                        onClick={(event) => handleHomeUpvote(event, post)}
                        aria-label={`Upvote ${post.title}`}
                      >
                        <img
                          className="post-detail-icon"
                          src={thumbUpIcon}
                          alt=""
                        />

                        {post.upvotes}
                      </button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom image */}
          <section className="bottom-image" aria-label="River landscape" />
        </main>
      </div>


  );
};


const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      // First check whether this is one of the hardcoded posts
      const examplePost = examplePosts.find(
        (example) => example.id === id
      );

      if (examplePost) {
        const savedUpvotes = getSavedExampleUpvotes();

        setPost({
          ...examplePost,
          upvotes: savedUpvotes[examplePost.id] ?? examplePost.upvotes,
        });
        return;
      }

      // Otherwise, get the matching post from Supabase
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        return;
      }

      setPost(data);
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", String(id))
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      setComments(data);
    };

    fetchComments();
  }, [id]);

  

  const handleImageUpload = async (event) => {
    const selectedImage = event.target.files?.[0];

    if (!selectedImage) {
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setUploadedImageUrl(previewUrl);

    if (String(id).startsWith("example-")) {
      return;
    }

    try {
      const { imageUrl, filePath } = await uploadPostImage(selectedImage);
      const { error } = await supabase
        .from("posts")
        .update({ image_url: imageUrl })
        .eq("id", id);

      if (error) {
        await removeUploadedImage(filePath);
        throw error;
      }

      setPost((currentPost) => ({ ...currentPost, image_url: imageUrl }));
    } catch (error) {
      console.error("Error uploading post image:", error);
      alert("The picture could not be saved. Check your Supabase Storage setup.");
    }
  };

  if (!post) {
    return (
      <main className="page view-post">
        <section className="section-card">
          <p>Loading post...</p>
        </section>
      </main>
    );
  }


  const handleUpvote = async () => {
    const updatedUpvotes = post.upvotes + 1;

    // Hardcoded example posts can update locally
    if (String(post.id).startsWith("example-")) {
      saveExampleUpvotes(post.id, updatedUpvotes);

      setPost({
        ...post,
        upvotes: updatedUpvotes,
      });

      return;
    }

    // Supabase posts update in the database
    const { error } = await supabase
      .from("posts")
      .update({ upvotes: updatedUpvotes })
      .eq("id", post.id);

    if (error) {
      console.error("Error updating upvotes:", error);
      return;
    }

    setPost({
      ...post,
      upvotes: updatedUpvotes,
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete “${post.title}”? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      console.error("Error deleting post:", error);
      alert("The post could not be deleted.");
      return;
    }

    navigate("/");
  };


  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentAuthor.trim() || !commentText.trim()) {
      alert("Please enter your name and comment.");
      return;
    }

    const newComment = {
      post_id: String(id),
      author: commentAuthor.trim(),
      comment_text: commentText.trim(),
    };

    const { data, error } = await supabase
      .from("comments")
      .insert(newComment)
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      // alert("The comment could not be added.");
      alert(error.message);
      return;
    }

    setComments([...comments, data]);
    setCommentAuthor("");
    setCommentText("");
  };

  return (
    <main className="page view-post">
      <section className="section-card">
        <h1>{post.title}</h1>

        <div className="view-post-image-area">
          {uploadedImageUrl || post.image_url ? (
            <img
              className="view-post-image"
              src={uploadedImageUrl || post.image_url}
              alt={`Travel view from ${post.destination}`}
            />
          ) : (
            <div className="view-post-image-placeholder">
              No picture added yet
            </div>
          )}

          <label className="image-upload-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            Choose a picture
          </label>
        </div>

        <p>
          <strong>By:</strong> {post.author}
        </p>

        <p>
          <strong>Location:</strong> {post.destination}
        </p>

        <p>{post.description}</p>

        <div className="post-actions">
          <button
            type="button"
            className="upvote-button"
            onClick={handleUpvote}
          >
            <img
              className="post-detail-icon"
              src={thumbUpIcon}
              alt=""
            />

            {post.upvotes} upvotes
          </button>

          {!String(post.id).startsWith("example-") && (
            <>
              <Link to={`/edit/${post.id}`} className="edit-button">
                Edit Post
              </Link>

              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
              >
                Delete Post
              </button>
            </>
          )}
        </div>

        <div className="comments-section">
          <h2>comments</h2>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={commentAuthor}
              onChange={(event) => setCommentAuthor(event.target.value)}
              placeholder="Your name"
            />

            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Leave a comment..."
            />

            <button type="submit" className="submit-button">
              Add Comment
            </button>
          </form>

          <div className="comment-list">
            {comments.length === 0 ? (
              <p>No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div className="comment-card" key={comment.id}>
                  <strong>{comment.author}</strong>

                  <p>{comment.comment_text}</p>

                  <small>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
        
      </section>
    </main>
  );
};


const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (String(id).startsWith("example-")) {
        navigate(`/posts/${id}`, { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        alert("The post could not be loaded.");
        navigate("/", { replace: true });
        return;
      }

      setTitle(data.title || "");
      setAuthor(data.author || "");
      setDestination(data.destination || "");
      setDescription(data.description || "");
      setImageUrl(data.image_url || "");
      setLoading(false);
    };

    fetchPost();
  }, [id, navigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!title.trim() || !author.trim() || !destination.trim()) {
      alert("Please fill in the title, author, and location.");
      return;
    }

    setSaving(true);
    let uploadedImage = null;

    try {
      if (imageFile) {
        uploadedImage = await uploadPostImage(imageFile);
      }

      const { error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          author: author.trim(),
          destination: destination.trim(),
          description: description.trim() || null,
          image_url: uploadedImage?.imageUrl || imageUrl || null,
        })
        .eq("id", id);

      if (error) {
        await removeUploadedImage(uploadedImage?.filePath);
        throw error;
      }

      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("The post could not be updated. Check your Supabase permissions.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page create-page">
        <section className="section-card">
          <p>Loading post...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page create-page">
      <section className="section-card">
        <h1>edit travel post</h1>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="edit-title">Post Title</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-author">Author</label>
            <input
              id="edit-author"
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-destination">Location</label>
            <input
              id="edit-destination"
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Content (optional)</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group image-form-group">
            <label htmlFor="edit-image">Replace Picture (optional)</label>
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </div>

          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? "Saving..." : "Update Post"}
          </button>
        </form>
      </section>
    </main>
  );
};


const CreatePost = () => {
  // variables to hold and update the form data
  const navigate = useNavigate();
  const[title, setTitle] = useState("");
  const[author, setAuthor] = useState("");
  const[location, setLocation] = useState("");
  const[content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // called when the form is submitted (meaning all the fields are filled out):
  const handleSubmit = async (event) => { // having the func be async is important so that we can also use "await", meaning we can wait for the supabase insert to finish before moving on to the next line of code.
    
    event.preventDefault(); // default behavior of a form submission is to refresh the page, but we don't want that to happen, so we prevent it.

    if (!title.trim() || !author.trim() || !location.trim()) {
      alert("Please fill in the title, author, and location.");
      return;
    }

    setSaving(true);
    let uploadedImage = null;

    try {
      if (imageFile) {
        uploadedImage = await uploadPostImage(imageFile);
      }

    // This combines the separate state values into one object:
    const newPost = {
      title: title.trim(),
      author: author.trim(),
      destination: location.trim(),
      description: content.trim() || null,
      upvotes: 0,
      image_url: uploadedImage?.imageUrl || null,
    };

    const { error } = await supabase // waits for the result from below operations:
      .from("posts") // opens the "posts" table in supabase
      .insert(newPost); // inserts a new row into the table with the data from the newPost object

    if (error) { //If Supabase reports an error: 
      await removeUploadedImage(uploadedImage?.filePath);
      throw error;
    }

    alert(`${title} was added!`);

    // reset the form fields after submission:
    setTitle("");
    setAuthor("");
    setLocation("");
    setContent("");
    setImageFile(null);

    navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      // alert("The post could not be created. Check your Supabase Storage and table permissions.");
      alert(error.message);
      setSaving(false);
    }
  };


  return (
    <main className="page create-page">
      <section className="section-card">
        <h1>create a new travel post</h1>

        {/* create a form: */}
        {/* when the form is submitted, it will call the handleSubmit function */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Post Title</label>

             {/* input block is for the title that you can type in */}
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Enter a title..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>

            <input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              type="text"
              placeholder="Enter your name..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>

            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              type="text"
              placeholder="Enter a location..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content (optional)</label>

            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post here..."
            />
          </div>

          <div className="form-group image-form-group">
            <label htmlFor="post-image">Picture (optional)</label>
            <input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </div>

          <button type="submit" className={
            title && author && location // content and image are optional
              ? "submit-button"
              : "submit-button disabled"
          } disabled={!title || !author || !location || saving}> 
            {saving ? "Creating..." : "Create Post"}
          </button>
        </form>
      </section>

      <img
        className="create-bottom-image"
        src={beachImage}
        alt="Beach landscape"
      />
    </main>
  );

};



function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/posts/:id" element={<ViewPost />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </>
  );
}


export default App
