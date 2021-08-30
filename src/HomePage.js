import React from 'react';
import './homepage.css';

const HomePage = () => {
    return (
        <div className="home-container">
            <article>
                <div className="center-column">
                    <div className="screed">
                        <div className="home-header">
                            RENTALJOCKEYS<br/>
                            <span>Rent or Buy, We Supply</span>
                        </div>
                        <div className="highlights-container">
                            <div className="highlight-box">
                                <div className="highlight-header">OUR LATEST</div>
                                <div className="highlight-content">
                                    <div style={{ display: 'flex' }}><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque fermentum suscipit purus et dapibus. Maecenas vel fringilla dolor. Phasellus quis sapien in lacus ultrices porttitor. In mollis porttitor lorem, sed cursus felis dignissim vel. <span className="callout">Praesent posuere,</span> tellus in sodales condimentum, leo arcu tempor massa, vel vehicula massa eros in risus. Nunc vel lorem interdum, sollicitudin erat vitae, vulputate ex. Nunc aliquam dui consectetur scelerisque commodo. Phasellus sodales et justo id pulvinar. Ut commodo urna in quam rhoncus, vel viverra nunc scelerisque. Suspendisse potenti. Duis dui nisi, consectetur eu erat ut, dapibus suscipit arcu. Etiam tortor augue, vulputate non orci eleifend, ullamcorper viverra lorem.</p><img src="https://www.photographyaxis.com/wp-content/uploads/Men-Casual-Dresscode-Headshot-Photography.jpg" style={{ height: "200px", marginLeft:"5px"}}/></div>
                                    <p>Curabitur tristique a tortor quis convallis. Aenean sollicitudin est et massa cursus, nec dictum nisl placerat. Quisque vel quam ac lorem mattis bibendum non in est. Nam quis consectetur dolor. Curabitur et maximus diam. Vivamus volutpat posuere lectus, in consectetur velit lobortis nec. Nunc urna lacus, mollis in sem ut, sagittis dignissim felis. Duis convallis magna vitae felis vulputate feugiat. Mauris a rhoncus enim. Sed quis rhoncus dolor.</p>
                                </div>
                            </div>
                            <div className="highlight-box">
                                <div className="highlight-header">SERVICES</div>
                                <div className="highlight-content">
                                    <p>Aliquam fringilla tempor purus in facilisis. Maecenas id nibh ipsum. Nullam vel lorem eu tellus pretium interdum. Integer eget elementum orci. Ut et ex tincidunt, molestie urna in, tincidunt velit. Nullam at metus sodales, varius enim eget, facilisis justo. Duis eu mauris id sapien luctus efficitur id at leo. Maecenas id nisi eros. Pellentesque nec rhoncus tellus. Suspendisse finibus nibh sapien, eu interdum risus luctus id. Morbi nec turpis id diam pharetra hendrerit. Sed finibus mi fermentum, maximus tortor id, lacinia risus. Suspendisse enim lorem, tempor egestas elementum et, sollicitudin sed diam. Nullam dolor justo, <span className="callout">"aliquet non congue dignissim, iaculis vel orci."</span></p>
                                    <p>Fusce turpis leo, finibus vel erat ut, convallis facilisis nisi. Pellentesque neque odio, lacinia non tellus non, sollicitudin ultricies leo. Praesent eros est, egestas eu mattis ut, maximus et purus. Suspendisse elit lectus, aliquam eu volutpat in, aliquet vel libero. Proin tristique risus et augue tempor, sed interdum est tincidunt. Proin ullamcorper quam eget felis scelerisque, vitae fermentum nulla euismod. Etiam facilisis neque eget risus suscipit, a luctus massa rutrum. Nam erat tellus, rhoncus vel iaculis venenatis, facilisis id mauris.</p>
                                </div>
                            </div>
                            <div className="highlight-box">
                                <div className="highlight-header">JOB POSTINGS</div>
                                <div className="highlight-content">
                                    <p><span className="callout">First Jockey</span> Aliquam nunc est, mattis ut auctor nec, pellentesque id libero. Ut eget nulla quis magna mattis sagittis non quis nisi. Donec in mi nisl.</p>
                                    <p><span className="callout">Box Opener</span> Aliquam nunc est, mattis ut auctor nec, pellentesque id libero. Ut eget nulla quis magna mattis sagittis non quis nisi. Donec in mi nisl.</p>
                                    <p><span className="callout">Box Coordinator</span> Aliquam nunc est, mattis ut auctor nec, pellentesque id libero. Ut eget nulla quis magna mattis sagittis non quis nisi. Donec in mi nisl.</p>
                                    <p><span className="callout">Jockey Services Manager</span> Aliquam nunc est, mattis ut auctor nec, pellentesque id libero. Ut eget nulla quis magna mattis sagittis non quis nisi. Donec in mi nisl.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default HomePage;