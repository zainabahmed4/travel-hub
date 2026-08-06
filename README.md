# Web Development Final Project - *Travel Hub*

Submitted by: **Zainab Ahmed**

This web app: **Travel Hub is a responsive travel blogging platform where users can create, browse, search, sort, upvote, comment on, edit, and delete travel posts. Posts and comments are stored with Supabase, and users can upload travel images from their computer.**

Time spent: **15** hours spent in total

## Required Features

The following **required** functionality is completed:


- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
  - Current status: post creation and optional text are implemented, and images can be uploaded from a computer through Supabase Storage; an external image URL field is not yet implemented
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
  - Current status: the feed and individual post navigation are implemented, but feed cards also display the post location
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    -  creation time
    -  upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page. 
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:


- [ ] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [ ] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [ ] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characteristics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [ ] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

* [x] Persistent post, comment, edit, delete, and upvote data using Supabase
* [x] Responsive custom interface with travel imagery, a looping hero video, custom icons, and mobile layouts
* [x] Direct image uploads through Supabase Storage with image previews on individual post pages
* [x] Persistent upvotes for bundled example posts using browser storage
* [x] Automatic scroll restoration so each routed page opens at the top

## Video Walkthrough

<img src="travel-hub-gif.gif" title="Travel Hub Video Walkthrough" width="100%" alt="Video walkthrough of the Travel Hub web app" />

<!-- Replace this with whatever GIF tool you used! -->
GIF created with [Kap](https://getkap.co/) for macOS


## Lessons Learned

Building Travel Hub required coordinating React state, client-side routing, and persistent Supabase data. One challenge was keeping upvote counts synchronized between the home feed and individual post pages while also supporting bundled example posts that do not exist in the database. Another was handling image uploads correctly: the image file is stored in Supabase Storage while its public URL is saved in the post record. I also learned how to model comments as a separate table linked to posts, use route parameters to fetch and edit individual records, and prevent nested interactions such as clicking an upvote button from opening the surrounding post link.

## License

    Copyright 2026 Zainab Ahmed

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
