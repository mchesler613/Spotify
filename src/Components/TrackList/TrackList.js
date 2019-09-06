import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
    /* 
    You will add a map method that renders a set of Track components
    */
    render() {
        return(
            <div className="TrackList">{
                this.props.tracks && this.props.tracks.map(
                    track => {
                        return <Track 
                            track={track} 
                            key={track.id} 
                            onAdd={this.props.onAdd} 
                            onRemove={this.props.onRemove} 
                            isRemoval={this.props.isRemoval} />
                    })}
            </div> 
        );
    }
};

export default TrackList;