import React from "react";
import { OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const ServiceInfo = ({ service, renderTooltip }) => {
    return (
        <OverlayTrigger
            placement="top"
            overlay={renderTooltip(service)}
        >
            <FontAwesomeIcon
                icon={faInfoCircle}
                className="mx-2"
                style={{ cursor: 'pointer' }}
            />
        </OverlayTrigger>
    );
};

export default ServiceInfo;
