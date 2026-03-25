using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class Response
    {
        public int StatusCode { get; set; }
        public object ResultList { get; set; }
        public string Message { get; set; }
        public object Data { get; internal set; }
    }
}