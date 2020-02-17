import React from 'react'
import './services.scss';
import Dotsbox1 from './dotsbox1';
import Box2 from './box2';
import Strip1 from './strips1';

export default props => {
    return (
        <div className='outer'>
            <div className='main'>
            <h1>We cherish the sweet moments...
</h1>
<p>For couples looking beyond the traditional wedding Sweet Corner offers the
modern day alternative to a traditional wedding cake. Stack your wedding cupcakes
on towering tiers or treat each guest to a sweet token of your wedded bliss.</p>
<p>Wedding cupcake prices average about $3.00 per person, depending on how
elaborate your cake design is.</p>
<p>A non-refundable fee of $50.00 is required to reserve your date and will be
deducted from your final bill.</p>
<p>Higher prices may apply to custom cupcake flavors and highly detailed cupcakes.</p>
<h1>Party Cupcakes</h1>
<p>Dress it up with the Sprinkles Cupcake or keep it simple and let the cupcakes shine!
</p>
<p>Simple birthday cupcakes, such as Barney, Batman, Three Princesses, Thomas the
Train, etc, range from $65 and up.</p>
<p>3D Custom Cakes, Helmets, Wine Bottles, Naughty Cakes, Logos are a minimum
$135.00+, will be based on time required and intricacy of the design.</p>
<h1>Gift Cupcake</h1>
<p>Sending our cupcakes by post is the perfect way to say pretty much anything you
can think of - from Happy Birthday and Welcome to your new home, to Thanks for a
lovely weekend and Congratulations on your new baby.</p>
<p>A yummy alternative to flowers, we can deliver cupcakes to any doorstep you
choose in California.</p>
<p>Not only do we offer a gift that is a little different - but the way we do it is pretty
special too.</p>
<p>Our cupcakes are sold in boxes of 6 and 12 and delivered directly to the address
you choose.</p>


            </div>
            <Dotsbox1 />
            <Strip1 />
            <Box2 />
        </div>
    );
}
